using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using Microsoft.Data.SqlClient;

namespace IV.Web.Data;

/// <summary>
/// 앨범 데이터를 조회/처리하기 위한 컨텍스트
/// </summary>
public class AlbumContext(IConfiguration configuration) : IAlbumContext
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                                                throw new InvalidOperationException("DB connection string not found.");

    // appsettings.json 등에 정의된 연결 문자열 사용

    /// <summary>
    /// 특정 사용자 ID에 해당하는 앨범 리스트를 비동기로 조회합니다.
    /// </summary>
    /// <param name="userId">사용자 ID</param>
    /// <returns>앨범 모델 리스트</returns>
    public async Task<List<AlbumModel>> GetAlbumByUserIdAsync(int userId)
    {
        var albums = new List<AlbumModel>();

        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand(@"
            SELECT 
                AlbumId,
                UserId,
                AlbumTitle,
                AlbumDescription,
                CreatedAt,
                IsPrivate
            FROM Album
            WHERE UserId = @UserId
            ORDER BY CreatedAt Desc
        ", conn);

        // 파라미터 설정
        cmd.Parameters.AddWithValue("@UserId", userId);

        await conn.OpenAsync();

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            // AlbumModel로 매핑
            var album = new AlbumModel
            {
                AlbumId = reader.GetInt32(reader.GetOrdinal("AlbumId")),
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                AlbumTitle = reader.GetString(reader.GetOrdinal("AlbumTitle")),
                AlbumDescription = reader.GetString(reader.GetOrdinal("AlbumDescription")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                IsPrivate = reader.GetBoolean(reader.GetOrdinal("IsPrivate"))
            };
            albums.Add(album);
        }

        return albums;
    }

    public async Task<AlbumModel?> GetAlbumById(int albumId, int userId)
    {
        var albums = new List<AlbumModel>();

        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand(@"
            SELECT 
                AlbumId,
                UserId,
                AlbumTitle,
                AlbumDescription,
                CreatedAt,
                IsPrivate,
                IsPaid,
                Price,
                PlanType
            FROM Album
            WHERE AlbumId = @AlbumId
            AND UserId = @UserId
            ORDER BY CreatedAt Desc
        ", conn);

        // 파라미터 설정
        cmd.Parameters.AddWithValue("@AlbumId", albumId);
        cmd.Parameters.AddWithValue("@UserId", userId);

        await conn.OpenAsync();

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            // AlbumModel로 매핑
            var album = new AlbumModel
            {
                AlbumId = reader.GetInt32(reader.GetOrdinal("AlbumId")),
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                AlbumTitle = reader.GetString(reader.GetOrdinal("AlbumTitle")),
                AlbumDescription = reader.GetString(reader.GetOrdinal("AlbumDescription")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                IsPrivate = reader.GetBoolean(reader.GetOrdinal("IsPrivate")),
                IsPaid = reader.GetBoolean(reader.GetOrdinal("IsPaid")),
                Price = reader.GetDecimal(reader.GetOrdinal("Price")),
                PlanType = reader.GetString(reader.GetOrdinal("PlanType"))
            };
            albums.Add(album);
        }

        return albums.FirstOrDefault();
    }

    /// <summary>
    ///     여러 앨범 정보를 데이터베이스에 삽입하고,
    ///     생성된 AlbumId 목록을 비동기로 반환합니다.
    /// </summary>
    /// <param name="albums">생성할 앨범 모델 리스트</param>
    /// <returns>생성된 앨범의 AlbumId 목록</returns>
    public async Task<List<int>> CreateAlbumsAsync(List<AlbumModel> albums)
    {
        var albumIds = new List<int>();

        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        // 트랜잭션 시작
        using var tran = conn.BeginTransaction();

        try
        {
            // 앨범 리스트를 순회하며 하나씩 INSERT
            foreach (var album in albums)
            {
                using var cmd = new SqlCommand(@"
                INSERT INTO Album (UserId, AlbumTitle, AlbumDescription, CreatedAt, IsPrivate)
                OUTPUT INSERTED.AlbumId
                VALUES (@UserId, @AlbumTitle, @AlbumDescription, @CreatedAt, @IsPrivate)
            ", conn, tran);

                // 파라미터 바인딩
                cmd.Parameters.AddWithValue("@UserId", album.UserId);
                cmd.Parameters.AddWithValue("@AlbumTitle", album.AlbumTitle);
                cmd.Parameters.AddWithValue("@AlbumDescription", album.AlbumDescription);
                cmd.Parameters.AddWithValue("@CreatedAt", album.CreatedAt);
                cmd.Parameters.AddWithValue("@IsPrivate", album.IsPrivate);

                var insertedId = (int)await cmd.ExecuteScalarAsync();
                albumIds.Add(insertedId);
            }

            // 문제 없이 모두 삽입되었다면 커밋
            tran.Commit();
        }
        catch
        {
            // 오류 발생 시 롤백
            tran.Rollback();
            throw;
        }

        return albumIds;
    }

    public async Task<List<AlbumModel>> GetAlbumDetailByIdAsync(int albumId)
    {
        var albums = new List<AlbumModel>();

        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand(@"
            SELECT 
                AlbumId,
                UserId,
                AlbumTitle,
                AlbumDescription,
                CreatedAt,
                IsPrivate
            FROM Album
            WHERE AlbumId = @AlbumId
        ", conn);

        // 파라미터 설정
        cmd.Parameters.AddWithValue("@AlbumId", albumId);

        await conn.OpenAsync();

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            // AlbumModel로 매핑
            var album = new AlbumModel
            {
                AlbumId = reader.GetInt32(reader.GetOrdinal("AlbumId")),
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                AlbumTitle = reader.GetString(reader.GetOrdinal("AlbumTitle")),
                AlbumDescription = reader.GetString(reader.GetOrdinal("AlbumDescription")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                IsPrivate = reader.GetBoolean(reader.GetOrdinal("IsPrivate"))
            };
            albums.Add(album);
        }

        return albums;
    }

    public async Task<List<AlbumPhotoModel>> GetAlbumThumbnailByIdAsync(int albumId)
    {
        var photos = new List<AlbumPhotoModel>();
        
        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand(@"
            SELECT TOP 1 *
            FROM [iv-database].[dbo].[AlbumPhoto]
            WHERE [AlbumId] = @AlbumId
            ORDER BY [CreatedAt] DESC;
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

    public async Task<bool> DeleteAlbumAsyncById(int albumId)
    {
        try
        {
            // DB 연결을 엽니다.
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                DELETE FROM Album
                WHERE AlbumId = @AlbumId
            ", conn);

            // 파라미터 설정
            cmd.Parameters.AddWithValue("@AlbumId", albumId);

            // 연결 후 쿼리 실행
            await conn.OpenAsync();
            var rowsAffected = await cmd.ExecuteNonQueryAsync();

            // 삭제된 레코드가 1건 이상인지 확인
            return rowsAffected > 0;
        }
        catch
        {
            // 예외 처리 (로그 남기기 등)
            return false;
        }

    }

    public async Task<bool> UpdateAlbumAsync(AlbumModel album)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
            UPDATE Album
            SET AlbumTitle = @AlbumTitle,
                AlbumDescription = @AlbumDescription,
                IsPrivate = @IsPrivate,
                IsPaid = @IsPaid,
                Price = @Price,
                PlanType = @PlanType
            WHERE AlbumId = @AlbumId AND UserId = @UserId;
        ", conn);

            // 파라미터 설정
            cmd.Parameters.AddWithValue("@AlbumId", album.AlbumId);
            cmd.Parameters.AddWithValue("@UserId", album.UserId);
            cmd.Parameters.AddWithValue("@AlbumTitle", album.AlbumTitle);
            cmd.Parameters.AddWithValue("@AlbumDescription", album.AlbumDescription);
            cmd.Parameters.AddWithValue("@IsPrivate", album.IsPrivate);
            cmd.Parameters.AddWithValue("@IsPaid", album.IsPaid);
            cmd.Parameters.AddWithValue("@Price", album.Price);
            cmd.Parameters.AddWithValue("@PlanType", album.PlanType);

            await conn.OpenAsync();
            var rowsAffected = await cmd.ExecuteNonQueryAsync();

            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            // 오류 발생 시 로그를 남기도록 추가 권장
            // 예시: _logger.LogError(ex, "앨범 업데이트 실패: AlbumId={AlbumId}", album.AlbumId);
            return false;
        }
    }

    public async Task<List<UserModel>> GetSubscribersByAlbumId(int albumId)
    {
        var subscribers = new List<UserModel>();

        using var conn = new SqlConnection(_connectionString);
        using var cmd = new SqlCommand(@"
        SELECT U.UserId, U.Email, U.Username, U.CreatedAt
        FROM AlbumSubscription AS ASUB
        INNER JOIN Users AS U ON ASUB.UserId = U.UserId
        WHERE ASUB.AlbumId = @AlbumId AND ASUB.IsActive = 1
        ORDER BY ASUB.SubscriptionDate DESC;
    ", conn);

        // 파라미터 설정
        cmd.Parameters.AddWithValue("@AlbumId", albumId);

        await conn.OpenAsync();

        using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
        {
            var user = new UserModel
            {
                UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                Email = reader.GetString(reader.GetOrdinal("Email")),
                Username = reader.GetString(reader.GetOrdinal("Username")),
                CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"))
                // UserModel에 필요한 다른 속성들이 있으면 여기에 추가하세요.
            };

            subscribers.Add(user);
        }

        return subscribers;
    }

    public async Task<string> InviteUserToAlbumAsync(string email, int albumId, int senderId)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);

            const string sql = @"
            DECLARE @InvitationToken UNIQUEIDENTIFIER = NEWID();
            
            INSERT INTO EmailInvitation 
            (
                RecipientEmail, 
                InvitationToken, 
                CreatedAt, 
                ExpiresAt, 
                IsUsed, 
                SenderId,
                AlbumId
            )
            VALUES 
            (
                @RecipientEmail, 
                @InvitationToken, 
                GETUTCDATE(), 
                DATEADD(DAY, 7, GETUTCDATE()), 
                0, 
                @SenderId,
                @AlbumId
            );

            SELECT @InvitationToken AS InvitationToken;
        ";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@RecipientEmail", email);
            cmd.Parameters.AddWithValue("@SenderId", senderId);
            cmd.Parameters.AddWithValue("@AlbumId", albumId);

            await conn.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                // InvitationToken 컬럼에서 고유 토큰을 가져옵니다.
                return reader["InvitationToken"]?.ToString();
            }

            // 토큰을 정상적으로 읽지 못했다면 null 처리
            return null;
        }
        catch
        {
            // 예외 발생 시 null 반환(추가 로깅/처리 가능)
            return null;
        }
    }

    public async Task<bool> ValidateInvitation(string email, string token, DateTime attachDate, int senderId)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);

            // 유효한 초대가 있는지 확인
            const string selectSql = @"
                SELECT COUNT(*)
                FROM EmailInvitation
                WHERE RecipientEmail = @Email
                  AND InvitationToken = @Token
                  AND SenderId = @SenderId
                  AND IsUsed = 0
                  AND ExpiresAt > @AttachDate
            ";

            using var selectCmd = new SqlCommand(selectSql, conn);
            selectCmd.Parameters.AddWithValue("@Email", email);
            selectCmd.Parameters.AddWithValue("@Token", token);
            selectCmd.Parameters.AddWithValue("@SenderId", senderId);
            selectCmd.Parameters.AddWithValue("@AttachDate", attachDate);

            await conn.OpenAsync();

            // 카운트 확인
            var count = (int)await selectCmd.ExecuteScalarAsync();

            // 유효한 초대가 없다면 바로 false 반환
            if (count <= 0)
            {
                return false;
            }

            // 유효하다면 IsUsed를 true(1)로 업데이트
            // const string updateSql = @"
            //     UPDATE EmailInvitation
            //     SET IsUsed = 1
            //     WHERE RecipientEmail = @Email
            //       AND InvitationToken = @Token
            //       AND SenderId = @SenderId
            //       AND IsUsed = 0
            //       AND ExpiresAt > @AttachDate
            // ";

            // using var updateCmd = new SqlCommand(updateSql, conn);
            // updateCmd.Parameters.AddWithValue("@Email", email);
            // updateCmd.Parameters.AddWithValue("@Token", token);
            // updateCmd.Parameters.AddWithValue("@SenderId", senderId);
            // updateCmd.Parameters.AddWithValue("@AttachDate", attachDate);

            // await updateCmd.ExecuteNonQueryAsync();

            // 모든 처리가 정상적으로 끝나면 true 반환
            return true;
        }
        catch (Exception ex)
        {
            // 예외 처리(로그 처리 등)
            // ...
            return false;
        }
    }

    public async Task<List<EmailInvitationModel>> GetInvitationByAlbumId(int albumId)
    {
        var invitations = new List<EmailInvitationModel>();
        try
        {
            using var conn = new SqlConnection(_connectionString);

            const string selectSql = @"
            SELECT
                Id,
                RecipientEmail,
                InvitationToken,
                CreatedAt,
                ExpiresAt,
                IsUsed,
                SenderId,
                InvitationStatus
            FROM EmailInvitation
            WHERE AlbumId = @AlbumId
        ";

            using var cmd = new SqlCommand(selectSql, conn);
            cmd.Parameters.AddWithValue("@AlbumId", albumId);

            await conn.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var invitation = new EmailInvitationModel
                {
                    Id = reader.GetInt32(0),
                    RecipientEmail = reader.GetString(1),
                    InvitationToken = reader.GetGuid(2),
                    CreatedAt = reader.GetDateTime(3),
                    ExpiresAt = reader.GetDateTime(4),
                    IsUsed = reader.GetBoolean(5),
                    SenderId = reader.GetInt32(6),
                    InvitationStatus = reader.GetString(7)
                };
                invitations.Add(invitation);
            }
        }
        catch (Exception ex)
        {
            // 예외 처리 (로그 처리 등)
            // ...
        }

        return invitations;
    }

    public async Task<bool> UpdateInvitationStatus(string email, string token, DateTime attachDate, int senderId, string invitationStatus)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);

            // 유효한 초대가 있는지 확인
            const string selectSql = @"
                SELECT COUNT(*)
                FROM EmailInvitation
                WHERE RecipientEmail = @Email
                  AND InvitationToken = @Token
                  AND SenderId = @SenderId
                  AND IsUsed = 0
                  AND ExpiresAt > @AttachDate
            ";

            using var selectCmd = new SqlCommand(selectSql, conn);
            selectCmd.Parameters.AddWithValue("@Email", email);
            selectCmd.Parameters.AddWithValue("@Token", token);
            selectCmd.Parameters.AddWithValue("@SenderId", senderId);
            selectCmd.Parameters.AddWithValue("@AttachDate", attachDate);

            await conn.OpenAsync();

            // 초대가 존재하지 않으면 false
            var count = (int)await selectCmd.ExecuteScalarAsync();
            if (count <= 0)
            {
                return false;
            }

            // InvitationStatus만 변경 (필요하다면 추가 컬럼도 업데이트 가능)
            const string updateSql = @"
            UPDATE EmailInvitation
            SET InvitationStatus = @InvitationStatus
            WHERE RecipientEmail = @Email
              AND InvitationToken = @Token
              AND SenderId = @SenderId
              AND ExpiresAt > @AttachDate
        ";

            using var updateCmd = new SqlCommand(updateSql, conn);
            updateCmd.Parameters.AddWithValue("@InvitationStatus", invitationStatus);
            updateCmd.Parameters.AddWithValue("@Email", email);
            updateCmd.Parameters.AddWithValue("@Token", token);
            updateCmd.Parameters.AddWithValue("@SenderId", senderId);
            updateCmd.Parameters.AddWithValue("@AttachDate", attachDate);

            await updateCmd.ExecuteNonQueryAsync();

            // 유효하다면 IsUsed를 true(1)로 업데이트
            const string updateSql2 = @"
                UPDATE EmailInvitation
                SET IsUsed = 1
                WHERE RecipientEmail = @Email
                  AND InvitationToken = @Token
                  AND SenderId = @SenderId
                  AND IsUsed = 0
                  AND ExpiresAt > @AttachDate
            ";

            using var updateCmd2 = new SqlCommand(updateSql2, conn);
            updateCmd2.Parameters.AddWithValue("@Email", email);
            updateCmd2.Parameters.AddWithValue("@Token", token);
            updateCmd2.Parameters.AddWithValue("@SenderId", senderId);
            updateCmd2.Parameters.AddWithValue("@AttachDate", attachDate);

            await updateCmd2.ExecuteNonQueryAsync();
            
            // 모든 처리가 정상적으로 끝나면 true 반환
            return true;
        }
        catch (Exception ex)
        {
            // 예외 처리(로그 처리 등)
            // ...
            return false;
        }
    }
}