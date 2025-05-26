using Azure.Storage.Blobs;
using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using Microsoft.Data.SqlClient;

namespace IV.Web.Data;

public class AlbumShortContext(IConfiguration configuration) : IAlbumShortContext
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                                                throw new InvalidOperationException("DB connection string not found.");
    private readonly string _azureConnection = configuration.GetConnectionString("AzureConnection") ?? throw new InvalidOperationException("AzureConnection string not found.");

    /// <summary>
    /// 앨범 ID, Short 파일의 Uri를 DB에 기록합니다.
    /// </summary>
    /// <param name="albumId">앨범 고유번호</param>
    /// <param name="fileUri">업로드된 Short URL</param>
    /// <returns>기록 성공 여부</returns>
    public async Task<bool> AddFileInfo(int albumId, string fileUri)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                INSERT INTO AlbumShort
                (
                    AlbumId,
                    VideoUrl
                )
                VALUES
                (
                    @AlbumId,
                    @VideoUrl
                );
            ", conn);

            cmd.Parameters.AddWithValue("@AlbumId", albumId);
            cmd.Parameters.AddWithValue("@VideoUrl", fileUri);

            await conn.OpenAsync();
            var rowsAffected = await cmd.ExecuteNonQueryAsync();

            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            // 로깅 등 예외처리
            Console.WriteLine($"[AddFileInfo] DB Insert Error: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// 앨범 Shorts 파일의 Uri를 가져옵니다.
    /// </summary>
    /// <param name="albumId">앨범 고유번호</param>
    /// <returns>앨범 Shorts</returns>
    public async Task<List<AlbumShortModel>> GetAlbumShortsByIdAsync(int albumId)
    {
        var result = new List<AlbumShortModel>();

        try
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
            SELECT ShortId, AlbumId, VideoUrl, CreatedAt
            FROM AlbumShort
            WHERE AlbumId = @AlbumId
        ", conn);

            cmd.Parameters.AddWithValue("@AlbumId", albumId);
            await conn.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var model = new AlbumShortModel
                {
                    // 예: 컬럼 인덱스와 타입에 맞게 매핑 (테이블 구조에 맞춰 조정 필요)
                    ShortId = reader.GetInt32(0),
                    AlbumId = reader.GetInt32(1),
                    VideoUrl = reader.GetString(2),
                    CreatedAt = reader.GetDateTime(3)
                };
                result.Add(model);
            }
        }
        catch (Exception ex)
        {
            // 예외 처리(로깅 등)
            Console.WriteLine($"[GetAlbumShortsByIdAsync] DB Select Error: {ex.Message}");
        }

        return result;
    }

    public async Task<bool> DeleteShortAsyncByShortId(int albumId, int shortId)
    {
        try
        {
            // 1) 앨범/Short 정보 조회 (DB에서 ShortUrl 가져오기)
            using var conn = new SqlConnection(_connectionString);
            using var selectCmd = new SqlCommand(@"
                SELECT VideoUrl
                FROM AlbumShort
                WHERE ShortId = @ShortId
                  AND AlbumId = @AlbumId
            ", conn);

            selectCmd.Parameters.AddWithValue("@ShortId", shortId);
            selectCmd.Parameters.AddWithValue("@AlbumId", albumId);

            await conn.OpenAsync();
            var shortUrlObj = await selectCmd.ExecuteScalarAsync();
            if (shortUrlObj == null)
            {
                return false; // 삭제 대상 Short가 없음
            }

            var shortUrl = shortUrlObj.ToString() ?? string.Empty;
            conn.Close();

            // 2) Azure Blob Storage에서 실제 Short 파일 삭제
            if (!string.IsNullOrEmpty(shortUrl))
            {
                var shortUri = new Uri(shortUrl);

                var segments = shortUri.Segments;
                if (segments.Length < 2)
                {
                    // URL 구조가 잘못된 경우
                    return false;
                }

                var containerNameFromUrl = segments[1].TrimEnd('/');

                var blobPathSegments = segments.Skip(2).ToArray();
                var decodedSegments = blobPathSegments
                    .Select(seg => Uri.UnescapeDataString(seg))
                    .ToArray();

                var blobName = string.Join(string.Empty, decodedSegments);

                var blobServiceClient = new BlobServiceClient(_azureConnection); // Azure 연결 문자열 (클래스 필드에 정의된 값)
                var containerClient = blobServiceClient.GetBlobContainerClient(containerNameFromUrl);
                var blobClient = containerClient.GetBlobClient(blobName);

                await blobClient.DeleteIfExistsAsync();
            }

            // 3) DB에서 Short 정보 삭제
            using var deleteConn = new SqlConnection(_connectionString);
            using var deleteCmd = new SqlCommand(@"
                DELETE FROM AlbumShort
                WHERE ShortId = @ShortId
                  AND AlbumId = @AlbumId
            ", deleteConn);

            deleteCmd.Parameters.AddWithValue("@ShortId", shortId);
            deleteCmd.Parameters.AddWithValue("@AlbumId", albumId);

            await deleteConn.OpenAsync();
            var rowsAffected = await deleteCmd.ExecuteNonQueryAsync();

            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            // 로그를 기록하거나 추가적인 예외 처리 영역 확보
            Console.WriteLine(ex.Message);
            return false;
        }
    }
    
    public async Task<bool> RegisterThumbnailAsync(string videoUrl, string thumbnailUrl, int albumId)
    {
        try
        {
            // DB에 VideoUrl 기준으로 ThumbnailUrl 업데이트
            using var conn = new SqlConnection(_connectionString);

            const string updateSql = @"
            UPDATE AlbumShort 
            SET ThumbnailUrl = @ThumbnailUrl
            WHERE VideoUrl = @VideoUrl AND AlbumId = @AlbumId
        ";

            using var cmd = new SqlCommand(updateSql, conn);

            // SQL 파라미터 설정
            cmd.Parameters.AddWithValue("@ThumbnailUrl", thumbnailUrl);
            cmd.Parameters.AddWithValue("@VideoUrl", videoUrl);
            cmd.Parameters.AddWithValue("@AlbumId", albumId);

            await conn.OpenAsync();
            var rowsUpdated = await cmd.ExecuteNonQueryAsync();

            // 수행된 업데이트 행이 있을 때 true 반환
            return rowsUpdated > 0;
        }
        catch (Exception ex)
        {
            // 오류 처리 및 로깅
            Console.WriteLine($"[오류] AlbumShortContext.RegisterThumbnailAsync: {ex.Message}");
            return false;
        }
    }
}