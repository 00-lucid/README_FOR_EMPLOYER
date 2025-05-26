using System.Diagnostics;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using IV.Shared.Interfaces.Services;

namespace IV.Web.Services;

public class AzureService(
    IConfiguration configuration
    ): IAzureService
{
    private readonly string _blobStorageToken = configuration.GetConnectionString("BlobStorageToken") ?? throw new InvalidOperationException("BlobStorageToken string not found.");
    private readonly string _shortBlobStorageToken = configuration.GetConnectionString("ShortBlobStorageToken") ?? throw new InvalidOperationException("BlobStorageToken string not found.");
    private string _azureConnection = configuration.GetConnectionString("AzureConnection") ?? throw new InvalidOperationException("AzureConnection string not found.");
    
    public async Task<bool> UploadChunkAsync(byte[] chunkData, int chunkIndex, string fileId, string containerName = "images")
    {
        try
        {
            var blobServiceClient = new BlobServiceClient(_azureConnection);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

            // 컨테이너가 없으면 생성
            await containerClient.CreateIfNotExistsAsync();

            // 파일 ID로 임시 Blob 이름 생성
            var tempBlobName = $"{fileId}.tmp";
            var blockBlobClient = containerClient.GetBlockBlobClient(tempBlobName);

            // 각 청크를 고유한 Block ID로 업로드(Stage)
            string blockIdStr = $"{fileId}_{chunkIndex}";
            var base64BlockId = Convert.ToBase64String(
                System.Text.Encoding.UTF8.GetBytes(blockIdStr)
            );

            using var stream = new MemoryStream(chunkData);

            // 청크 스테이징
            await blockBlobClient.StageBlockAsync(
                base64BlockId: base64BlockId,
                content: stream);

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return false;
        }
    }

    public async Task<string> MergeChunksAsync(string fileId, string? finalExtension = null, string containerName = "images")
    {
            try
            {
                var blobServiceClient = new BlobServiceClient(_azureConnection);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

                var tempBlobName = $"{fileId}.tmp";
                var blockBlobClient = containerClient.GetBlockBlobClient(tempBlobName);

                // 최종 Blob 이름(확장자가 있다면 적용)
                var finalBlobName = string.IsNullOrWhiteSpace(finalExtension)
                    ? tempBlobName
                    : $"{fileId}{finalExtension}";

                var finalBlobClient = containerClient.GetBlockBlobClient(finalBlobName);

                // 스테이징된 블록 목록(Committed + Uncommitted) 가져오기
                var blockList = await blockBlobClient.GetBlockListAsync(BlockListTypes.All);

                var allBlocks = new List<string>();

                // 이미 커밋된 블록
                foreach (var b in blockList.Value.CommittedBlocks)
                {
                    allBlocks.Add(b.Name);
                }
                // 아직 커밋되지 않은 블록
                foreach (var b in blockList.Value.UncommittedBlocks)
                {
                    allBlocks.Add(b.Name);
                }

                // 모든 블록을 커밋
                await blockBlobClient.CommitBlockListAsync(allBlocks);

                // 확장자 변경이 필요한 경우, 복사 후 기존 임시 이름 삭제
                if (!string.IsNullOrWhiteSpace(finalExtension))
                {
                    // 복사 시작
                    await finalBlobClient.StartCopyFromUriAsync(blockBlobClient.Uri);

                    // 복사가 완료될 때까지 대기
                    var props = await finalBlobClient.GetPropertiesAsync();
                    while (props.Value.CopyStatus == CopyStatus.Pending)
                    {
                        await Task.Delay(300);
                        props = await finalBlobClient.GetPropertiesAsync();
                    }

                    // 복사 성공 시 .tmp 블랍 제거
                    if (props.Value.CopyStatus == CopyStatus.Success)
                    {
                        await blockBlobClient.DeleteIfExistsAsync();
                    }

                    // 최종 파일의 URI 문자열 반환
                    return finalBlobClient.Uri.ToString();
                }
                else
                {
                    // .tmp 그대로 사용 시, 해당 URI 문자열 반환
                    return blockBlobClient.Uri.ToString();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                // 에러 시, 빈 문자열 등의 처리
                return string.Empty;
            }
    }
    
    public async Task<string> GenerateAndUploadThumbnailAsync(string videoUrl, string containerName = "images")
    {
        try
        {
            // BlobClient 생성 및 Blob OpenReadAsync 스트림 구성
            var videoBlobClient = new BlobClient(new Uri(videoUrl + "?" + _shortBlobStorageToken));
            await using var videoStream = await videoBlobClient.OpenReadAsync(new BlobOpenReadOptions(allowModifications: false));

            // FFmpeg 프로세스 구성 (입출력 모두 표준 입출력 활용)
            var ffmpegStartInfo = new ProcessStartInfo
            {
                FileName = "ffmpeg",
                Arguments = "-i pipe: -ss 00:00:01.000 -frames:v 1 -f image2 pipe:1",
                CreateNoWindow = true,
                UseShellExecute = false,
                RedirectStandardInput = true,   // 영상 데이터를 입력으로 전달
                RedirectStandardOutput = true,  // 썸네일 데이터를 출력으로 받음
                RedirectStandardError = true
            };

            using var process = Process.Start(ffmpegStartInfo);

            if (process == null)
                throw new InvalidOperationException("FFmpeg 프로세스 시작 실패.");

            // 영상 데이터의 일부(최대 10MB)를 FFmpeg의 표준 입력으로 전달
            var buffer = new byte[81920]; // 80KB씩 읽기
            int read;
            var totalReadBytes = 0; 
            const int MAX_READ_BYTES = 10 * 1024 * 1024; // 최대 10MB까지 읽기 제한 (충분한 데이터만 넘김)

            await using (var ffmpegInput = process.StandardInput.BaseStream)
            {
                while ((read = await videoStream.ReadAsync(buffer.AsMemory(0, buffer.Length))) > 0)
                {
                    await ffmpegInput.WriteAsync(buffer.AsMemory(0, read));
                    totalReadBytes += read;

                    if (totalReadBytes >= MAX_READ_BYTES)
                        break;
                }
            }

            // FFmpeg 프로세스에서 생성한 썸네일 결과를 메모리 스트림으로 즉시 읽기
            await using var thumbnailMemoryStream = new MemoryStream();
            await process.StandardOutput.BaseStream.CopyToAsync(thumbnailMemoryStream);
            
            // 프로세스 정상 종료 대기
            await process.WaitForExitAsync();

            // 썸네일 스트림 업로드 준비
            thumbnailMemoryStream.Position = 0; // 업로드 전 스트림 위치 초기화  

            // Azure Blob Storage에 바로 업로드
            var blobServiceClient = new BlobServiceClient(_azureConnection);
            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
            await containerClient.CreateIfNotExistsAsync();

            var thumbnailFileName = $"{Guid.NewGuid()}.jpg";
            var thumbnailBlobClient = containerClient.GetBlobClient(thumbnailFileName);

            await thumbnailBlobClient.UploadAsync(thumbnailMemoryStream, overwrite: true);

            return thumbnailBlobClient.Uri.ToString();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Azure 썸네일 생성 오류] {ex.Message}");
            throw;
        }
    }
}