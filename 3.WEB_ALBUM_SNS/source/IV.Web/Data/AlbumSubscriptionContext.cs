using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using Microsoft.Data.SqlClient;

namespace IV.Web.Data;

public class AlbumSubscriptionContext(
    IConfiguration configuration
    ): IAlbumSubscriptionContext
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                                                throw new InvalidOperationException("DB connection string not found.");
    
    public Task<List<AlbumSubscriptionModel>> GetSubscriptionsByUserIdAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> SubscribeToAlbumAsync(int userId, int albumId)
{
    try
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        // 이미 구독 행이 있는지 확인
        using (var checkCmd = new SqlCommand(@"
            SELECT COUNT(1)
            FROM AlbumSubscription
            WHERE UserId = @UserId AND AlbumId = @AlbumId;
        ", conn))
        {
            checkCmd.Parameters.AddWithValue("@UserId", userId);
            checkCmd.Parameters.AddWithValue("@AlbumId", albumId);

            var exists = (int)(await checkCmd.ExecuteScalarAsync()) > 0;

            // 이미 구독 행이 존재한다면, IsActive 만 1로 업데이트
            if (exists)
            {
                using var updateCmd = new SqlCommand(@"
                    UPDATE AlbumSubscription
                    SET IsActive = 1
                    WHERE UserId = @UserId AND AlbumId = @AlbumId;
                ", conn);

                updateCmd.Parameters.AddWithValue("@UserId", userId);
                updateCmd.Parameters.AddWithValue("@AlbumId", albumId);

                return await updateCmd.ExecuteNonQueryAsync() > 0;
            }
            else
            {
                // 새로 구독 행을 추가
                using var insertCmd = new SqlCommand(@"
                    INSERT INTO AlbumSubscription
                    (
                        UserId,
                        AlbumId,
                        SubscriptionDate,
                        IsActive
                    )
                    VALUES
                    (
                        @UserId,
                        @AlbumId,
                        GETDATE(),
                        1
                    );
                ", conn);

                insertCmd.Parameters.AddWithValue("@UserId", userId);
                insertCmd.Parameters.AddWithValue("@AlbumId", albumId);

                return await insertCmd.ExecuteNonQueryAsync() > 0;
            }
        }
    }
    catch (Exception ex)
    {
        // 예외 처리(로그 등)
        Console.WriteLine($"Error in SubscribeToAlbumAsync: {ex.Message}");
        return false;
    }
}

    public async Task<bool> UnsubscribeFromAlbumAsync(int userId, int albumId)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                UPDATE AlbumSubscription
                SET IsActive = 0
                WHERE UserId = @UserId AND AlbumId = @AlbumId AND IsActive = 1;
            ", conn);

            // 파라미터 설정
            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@AlbumId", albumId);

            await conn.OpenAsync();
            var rowsAffected = await cmd.ExecuteNonQueryAsync();

            // 업데이트가 성공적으로 이루어졌는지 확인
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            // 예외 처리 및 로그 기록
            Console.WriteLine($"Error in UnsubscribeFromAlbumAsync: {ex.Message}");
            return false;
        }

    }

    public async Task<bool> IsSubscribedToAlbumAsync(int userId, int albumId)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                SELECT COUNT(1)
                FROM AlbumSubscription
                WHERE UserId = @UserId AND AlbumId = @AlbumId AND IsActive = 1;
            ", conn);

            // 파라미터 설정
            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@AlbumId", albumId);

            await conn.OpenAsync();
            var result = await cmd.ExecuteScalarAsync();

            // 결과 변환 및 반환 (1 이상이면 true, 아니면 false)
            return Convert.ToInt32(result) > 0;
        }
        catch (Exception ex)
        {
            // 예외 처리 및 로그 기록
            Console.WriteLine($"Error in IsSubscribedToAlbumAsync: {ex.Message}");
            return false;
        }
    }
}