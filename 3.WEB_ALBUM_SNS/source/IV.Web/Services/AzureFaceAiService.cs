using Azure;
using Azure.AI.Vision.Face;
using IV.Shared.Interfaces.Services;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace IV.Web.Services;

public class AzureFaceAiService(
    IConfiguration configuration, 
    IAzureService _azureService
    ): IAzureFaceAiService
{
    private string _faceAiApiKey = configuration.GetConnectionString("FaceAiApiKey") ?? throw new InvalidOperationException("FaceAiApiKey string not found.");
    private string _faceAiEndpoint = configuration.GetConnectionString("FaceAiEndpoint") ?? throw new InvalidOperationException("FaceAiEndpoint string not found.");
    
    /// <summary>
    /// 지정된 로컬 이미지 파일을 읽어 얼굴이 감지되면 블러 처리 후, 결과 이미지를 새 파일로 저장합니다.
    /// 저장된 이미지 경로(또는 URL 등)를 반환합니다.
    /// </summary>
    /// <param name="imageUrl">블러를 적용할 원본 이미지 위치</param>
    /// <param name="cancellationToken">취소 요청 등록</param>
    /// <returns>블러 처리된 이미지 경로</returns>
    public async Task<string> BlurFacesIfNeededAsync(string imageUrl, CancellationToken cancellationToken = new ())
    {
        try
        {
            // FaceClient 생성
            FaceClient faceClient = new FaceClient(new Uri(_faceAiEndpoint), new AzureKeyCredential(_faceAiApiKey));

            // (중요) DetectAsync 매개변수: 
            // FaceDetectionModel, FaceRecognitionModel, returnFaceId, faceAttributes[] 순서
            var response = await faceClient.DetectAsync(
                new Uri(imageUrl),
                detectionModel: FaceDetectionModel.Detection03, // 또는 Detection01, Detection02, Latest 등
                recognitionModel: FaceRecognitionModel.Recognition03, // 필요 없다면 null or 다른 값
                returnFaceId: true, // 얼굴 ID 반환 여부
                cancellationToken: cancellationToken
            );

            // 감지 결과
            IReadOnlyList<FaceDetectionResult> detectedFaces = response.Value;
            if (detectedFaces == null || detectedFaces.Count == 0)
            {
                Console.WriteLine("얼굴이 감지되지 않음 → 원본 그대로 사용");
                return imageUrl;
            }

            // ImageSharp로 이미지 로드 후, 얼굴 블러
            using Image<Rgba32> image = Image.Load<Rgba32>(imageUrl);

            foreach (var faceResult in detectedFaces)
            {
                var rectInfo = faceResult.FaceRectangle;
                if (rectInfo is null) continue;

                // float/double → int 변환
                int left = (int)rectInfo.Left;
                int top = (int)rectInfo.Top;
                int width = (int)rectInfo.Width;
                int height = (int)rectInfo.Height;

                // 이미지 경계 확인
                if (left < 0) left = 0;
                if (top < 0) top = 0;
                if (left + width > image.Width) width = image.Width - left;
                if (top + height > image.Height) height = image.Height - top;
                if (width <= 0 || height <= 0) continue;

                // 지정 영역에 가우시안 블러 적용
                var faceRegion = new Rectangle(left, top, width, height);
                image.Mutate(ctx =>
                {
                    ctx.GaussianBlur(8.0f, faceRegion); // 강도 조절
                });
            }

            // 5) 블러된 이미지를 Azure Blob Storage에 업로드하기
            //    - 파일 확장자를 그대로 사용하거나, 필요 시 다른 형식으로 변경 가능
            string ext = Path.GetExtension(imageUrl);

            // 임시 파일 ID(Blob 업로드 시 구분용)
            // 필요에 따라 Guid, 날짜, 또는 커스텀 로직을 써서 fileId 생성
            string fileId = Guid.NewGuid().ToString();

            // (A) 메모리 스트림으로 ImageSharp 이미지를 저장
            //     JPEG처럼 필요한 포맷으로 지정 가능(기본 포맷 외도 가능)
            using var outStream = new MemoryStream();
            await image.SaveAsync(outStream, Image.DetectFormat(imageUrl)); // 확장자에 맞춰 자동 인식
            outStream.Position = 0; // 업로드용 스트림 위치 초기화

            // (B) 일정 크기로 쪼개면서 chunk 업로드 (크기는 예시로 1 MB 정도)
            int chunkSize = 1 * 1024 * 1024;
            byte[] buffer = new byte[chunkSize];
            int index = 0, readBytes;

            while ((readBytes = await outStream.ReadAsync(buffer, 0, chunkSize, cancellationToken)) > 0)
            {
                // chunkData를 필요한 길이만큼 잘라 전달
                byte[] chunkData = (readBytes == chunkSize)
                    ? buffer
                    : buffer[..readBytes];

                bool uploaded = await _azureService.UploadChunkAsync(
                    chunkData,
                    chunkIndex: index,
                    fileId: fileId,
                    containerName: "images"
                );

                if (!uploaded)
                    throw new Exception($"Blob chunk upload 실패 - fileId: {fileId}, index: {index}");

                index++;
            }

            // (C) 모든 조각을 성공적으로 업로드한 뒤, Blob 합치기
            string finalUrl = await _azureService.MergeChunksAsync(
                fileId: fileId,
                finalExtension: ext,
                containerName: "images"
            );

            // 업로드된 Blob의 최종 경로(또는 URL) 반환
            Console.WriteLine($"얼굴 블러 이미지 업로드 완료: {finalUrl}");
            return finalUrl;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return string.Empty;
        }   
    }
}