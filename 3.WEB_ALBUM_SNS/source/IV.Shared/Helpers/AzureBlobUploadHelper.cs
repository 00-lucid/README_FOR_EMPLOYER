using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Blobs.Specialized;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System;

namespace IV.Shared.Helpers
{
    public class AzureBlobUploadHelper(string connectionString, string containerName)
    {
        /// <summary>
        /// 앨범 ID, 파일 ID, 청크 데이터, 청크 인덱스를 받아서
        /// 지정된 Blob에 StageBlock 형태로 업로드합니다.
        /// </summary>
        public async Task<bool> UploadChunkAsyncByAlbumId(int albumId, byte[] chunkData, int chunkIndex, string fileId)
        {
            try
            {
                var blobServiceClient = new BlobServiceClient(connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

                // 컨테이너가 없으면 생성
                await containerClient.CreateIfNotExistsAsync();

                // 앨범 ID + 파일 ID로 임시 Blob 이름 생성
                var tempBlobName = $"{albumId}-{fileId}.tmp";
                var blockBlobClient = containerClient.GetBlockBlobClient(tempBlobName);

                // 각 청크를 고유한 Block ID로 업로드(Stage)
                // → 중복 가능성을 줄이기 위해 Guid 등을 추가하여 BlockID를 더 안전하게 생성 가능
                // 예: "{chunkIndex}-{Guid.NewGuid()}"
                var blockIdStr = $"{chunkIndex}-{Guid.NewGuid()}";
                var base64BlockId = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(blockIdStr));

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

        public async Task<string> MergeChunksAsync(int albumId, string fileId, string? finalExtension = null)
        {
            try
            {
                var blobServiceClient = new BlobServiceClient(connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(containerName);

                var tempBlobName = $"{albumId}-{fileId}.tmp";
                var blockBlobClient = containerClient.GetBlockBlobClient(tempBlobName);

                // 최종 Blob 이름(확장자가 있다면 적용)
                var finalBlobName = string.IsNullOrWhiteSpace(finalExtension)
                    ? tempBlobName
                    : $"{albumId}-{fileId}{finalExtension}";

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
                        await Task.Delay(500);
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
    }
}