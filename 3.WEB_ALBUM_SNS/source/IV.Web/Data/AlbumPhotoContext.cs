using Azure.Storage.Blobs;
using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using Microsoft.Data.SqlClient;

namespace IV.Web.Data;

public class AlbumPhotoContext(IConfiguration configuration): IAlbumPhotoContext
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                                                throw new InvalidOperationException("DB connection string not found.");
    private readonly string _azureConnection = configuration.GetConnectionString("AzureConnection") ?? throw new InvalidOperationException("AzureConnection string not found.");

    /// <summary>
    /// 특정 앨범 ID에 해당하는 사진 리스트를 비동기로 조회합니다.
    /// </summary>
    /// <param name="albumId">앨범 ID</param>
    /// <returns>앨범 사진 모델 리스트</returns>
    public async Task<List<AlbumPhotoModel>> GetAlbumPhotoByIdAsync(int albumId)
    {
        var photos = new List<AlbumPhotoModel>();

        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand(@"
            SELECT 
                AlbumPhotoId,
                AlbumId,
                PhotoUrl, 
                CreatedAt
            FROM AlbumPhoto
            WHERE AlbumId = @AlbumId
            ORDER BY CreatedAt Desc
        ", conn);

        // 파라미터 설정
        cmd.Parameters.AddWithValue("@AlbumId", albumId);

        await conn.OpenAsync();

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var photo = new AlbumPhotoModel()
            {
                AlbumPhotoId = reader.GetInt32(reader.GetOrdinal("AlbumPhotoId")),
                AlbumId = reader.GetInt32(reader.GetOrdinal("AlbumId")),
                PhotoUrl = reader.GetString(reader.GetOrdinal("PhotoUrl")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
            };
            photos.Add(photo);
        }

        return photos;
    }

    public async Task<bool> UploadPhotoAsync(int albumId, Stream fileStream, string fileName)
    {
        try
        {
            // 1) 로컬에 사진 파일 저장
            // 경로: ../IV/wwwroot/images
            var uploadsFolder = Path.Combine("wwwroot", "_content", "IV.Shared", "images");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // 고유한 파일 이름 생성 (예: GUID)
            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // 파일 스트림을 실제 파일로 저장
            using var writeStream = new FileStream(filePath, FileMode.Create, FileAccess.Write);
            await fileStream.CopyToAsync(writeStream);

            // 2) DB에 PhotoUrl(파일 경로), AlbumId 기록
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                INSERT INTO AlbumPhoto
                (
                    AlbumId,
                    PhotoUrl
                )
                VALUES
                (
                    @AlbumId,
                    @PhotoUrl
                );
            ", conn);

            cmd.Parameters.AddWithValue("@AlbumId", albumId);
            // 앨범 사진 실제 접근 경로(/_content/IV.Shared/images/...)를 PhotoUrl로 저장
            cmd.Parameters.AddWithValue("@PhotoUrl", $"https://iv-webapp.azurewebsites.net/_content/IV.Shared/images/{uniqueFileName}");

            await conn.OpenAsync();
            var rowsAffected = await cmd.ExecuteNonQueryAsync();

            // rowsAffected가 1 이상이면 성공
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            // 예외 발생 시 로그 처리 등
            Console.WriteLine(ex.Message);
            return false;
        }
    }

    public async Task<bool> DeletePhotoAsyncByPhotoId(int albumId, int photoId)
    {
        try
        {
            // 1) 앨범/사진 정보 조회 (DB에서 PhotoUrl 가져오기)
            using var conn = new SqlConnection(_connectionString);
            using var selectCmd = new SqlCommand(@"
                SELECT PhotoUrl
                FROM AlbumPhoto
                WHERE AlbumPhotoId = @PhotoId
                  AND AlbumId = @AlbumId
            ", conn);

            selectCmd.Parameters.AddWithValue("@PhotoId", photoId);
            selectCmd.Parameters.AddWithValue("@AlbumId", albumId);

            await conn.OpenAsync();
            var photoUrlObj = await selectCmd.ExecuteScalarAsync();
            if (photoUrlObj == null)
            {
                return false; // 해당 사진이 없을 경우, 삭제 대상 없음
            }

            var photoUrl = photoUrlObj.ToString() ?? string.Empty;
            conn.Close();

            // 2) 실제 파일을 Azure Blob Storage에서 삭제
            //    여기서는 PhotoUrl이 "https://계정명.blob.core.windows.net/컨테이너명/폴더/파일명" 형태라고 가정
            if (!string.IsNullOrEmpty(photoUrl))
            {
                // URL을 Uri로 변환
                var photoUri = new Uri(photoUrl);

                // Example) photoUri.Host = "{계정명}.blob.core.windows.net"
                // Example) photoUri.LocalPath = "/{컨테이너명}/폴더/파일명"

                // 호스트(계정명)이나 컨테이너 이름을 파싱해야 함
                // 호스트: {계정명}.blob.core.windows.net
                // 첫 번째 세그먼트는 "/" (root)
                // 두 번째 세그먼트는 "컨테이너명/"
                // 그 이후 세그먼트가 폴더/파일명

                var segments = photoUri.Segments;
                if (segments.Length < 2)
                {
                    // URL 구조가 예상과 다르면 에러 처리
                    // 예: https://계정명.blob.core.windows.net/ => segment 길이가 1이거나 2여도 폴더나 파일이 없을 수 있음
                    return false;
                }

                // 두 번째 세그먼트를 컨테이너 이름으로 간주 (마지막에 "/"가 포함되어 있을 수 있으니 Trim)
                var containerNameFromUrl = segments[1].TrimEnd('/');
                // 나머지 경로(세그먼트)를 합쳐서 Blob 경로(blobName)로 사용
                // 만약 컨테이너명 이후에 여러 폴더가 있다면 그 뒤의 세그먼트를 전부 연결해야 함
                var blobPathSegments = segments.Skip(2).ToArray();
                
                var decodedSegments = blobPathSegments
                    .Select(seg => Uri.UnescapeDataString(seg))
                    .ToArray();

                var blobName = string.Join(string.Empty, decodedSegments);  // "folder/파일.jpg" 형태 등

                // 이제 Blob을 가리키는 BlobClient 생성
                var blobServiceClient = new BlobServiceClient(_azureConnection); // 이 클래스 어딘가에 저장된 Azure 연결 문자열
                var containerClient = blobServiceClient.GetBlobContainerClient(containerNameFromUrl);

                // 실제 blobName으로 BlobClient 생성
                var blobClient = containerClient.GetBlobClient(blobName);

                // Blob 삭제 시도
                await blobClient.DeleteIfExistsAsync();
            }

            // 3) DB에서 사진 정보 삭제
            using var deleteConn = new SqlConnection(_connectionString);
            using var deleteCmd = new SqlCommand(@"
                DELETE FROM AlbumPhoto
                WHERE AlbumPhotoId = @PhotoId
                  AND AlbumId = @AlbumId
            ", deleteConn);

            deleteCmd.Parameters.AddWithValue("@PhotoId", photoId);
            deleteCmd.Parameters.AddWithValue("@AlbumId", albumId);

            await deleteConn.OpenAsync();
            var rowsAffected = await deleteCmd.ExecuteNonQueryAsync();

            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            // 예외 처리(로그 등)
            Console.WriteLine(ex.Message);
            return false;
        }
    }

    public async Task<bool> UploadChunkAsyncByAlbumId(int albumId, byte[] chunkData, int chunkIndex, string fileId)
    {
        try
        {
            // 예: wwwroot/tmp/ 경로 지정
            var tempFolder = Path.Combine("wwwroot", "_content", "IV.Shared", "tmp");
            if (!Directory.Exists(tempFolder))
                Directory.CreateDirectory(tempFolder);

            // 앨범 ID + 파일ID로 고유한 임시 파일명
            // "1234-xxxx-xxxx-xxxx.tmp"
            var tempFileName = $"{albumId}-{fileId}.tmp";
            var tempFilePath = Path.Combine(tempFolder, tempFileName);

            // Append 모드로 파일 열기
            using var fs = new FileStream(tempFilePath, FileMode.Append, FileAccess.Write);
            await fs.WriteAsync(chunkData, 0, chunkData.Length);

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return false;
        }
    }

    public async Task<bool> FinishChunkUploadAsyncByAlbumId(int albumId, string fileId, string originalFileName)
    {
        try
        {
            // temp 경로
            var tempFolder = Path.Combine("wwwroot", "_content", "IV.Shared", "tmp");
            var tempFileName = $"{albumId}-{fileId}.tmp";
            var tempFilePath = Path.Combine(tempFolder, tempFileName);

            if (!File.Exists(tempFilePath))
            {
                // 임시 파일이 없으면 실패 처리
                return false;
            }

            // 실제 업로드 폴더
            var uploadsFolder = Path.Combine("wwwroot", "_content", "IV.Shared", "images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // 최종 파일이름 (GUID + 원본 파일 이름 등)
            string uniqueFileName = $"{Guid.NewGuid()}_{originalFileName}";
            var finalPath = Path.Combine(uploadsFolder, uniqueFileName);

            // 임시 파일 -> 최종 위치로 Move
            // (overwrite: false) 필요시 true로 사용
            File.Move(tempFilePath, finalPath, false);

            // DB Insert
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                INSERT INTO AlbumPhoto
                (
                    AlbumId,
                    PhotoUrl
                )
                VALUES
                (
                    @AlbumId,
                    @PhotoUrl
                );
            ", conn);

            cmd.Parameters.AddWithValue("@AlbumId", albumId);
            // PhotoUrl 경로에 최종 access url을 넣어줍니다.
            // 예) https://{도메인}/_content/IV.Shared/images/<파일명>
            cmd.Parameters.AddWithValue("@PhotoUrl", $"https://iv-webapp.azurewebsites.net/_content/IV.Shared/images/{uniqueFileName}");

            await conn.OpenAsync();
            var rowsAffected = await cmd.ExecuteNonQueryAsync();

            // 성공 시, 임시파일 처리 완료
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return false;
        }
    }

    public async Task<bool> AddFileInfo(int albumId, string fileUri)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                INSERT INTO AlbumPhoto
                (
                    AlbumId,
                    PhotoUrl
                )
                VALUES
                (
                    @AlbumId,
                    @PhotoUrl
                );
            ", conn);

            cmd.Parameters.AddWithValue("@AlbumId", albumId);
            // PhotoUrl 경로에 최종 access url을 넣어줍니다.
            // 예) https://{도메인}/_content/IV.Shared/images/<파일명>
            cmd.Parameters.AddWithValue("@PhotoUrl", fileUri);

            await conn.OpenAsync();
            var rowsAffected = await cmd.ExecuteNonQueryAsync();

            // 성공 시, 임시파일 처리 완료
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return false;
        }
    }
}