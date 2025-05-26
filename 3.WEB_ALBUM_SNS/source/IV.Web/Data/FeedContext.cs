using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using IV.Shared.Pages;
using Microsoft.Data.SqlClient;

namespace IV.Web.Data;

public class FeedContext(
    IConfiguration configuration
    ): IFeedContext
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                                                throw new InvalidOperationException("DB connection string not found.");
    
    public Task<FeedModel?> GetFeedByIdAsync(int feedId)
    {
        throw new NotImplementedException();
    }

    public Task<List<FeedModel>> GetFeedsByAlbumIdAsync(int albumId)
    {
        throw new NotImplementedException();
    }

    public async Task<int> CreateFeedAsync(int albumId, int creatorUserId, string body)
    {
        int newFeedId = 0;

        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var cmd = new SqlCommand(@"
            INSERT INTO Feed (AlbumId, CreatorUserId, LikeCount, CommentCount, Body)
            OUTPUT INSERTED.FeedId
            VALUES (@AlbumId, @CreatorUserId, 0, 0, @Body)
        ", conn);

            cmd.Parameters.AddWithValue("@AlbumId", albumId);
            cmd.Parameters.AddWithValue("@CreatorUserId", creatorUserId);
            cmd.Parameters.AddWithValue("@Body", body);

            // INSERTED.FeedId를 ExecuteScalarAsync()로 가져온 뒤 int로 변환
            newFeedId = Convert.ToInt32(await cmd.ExecuteScalarAsync());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in CreateFeedAsync: {ex.Message}");
        }

        return newFeedId;
    }

    public async Task<bool> CreateFeedAlbumPhotoAsync(int feedId, int photoId, int sortOrder)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var cmd = new SqlCommand(@"
            INSERT INTO FeedAlbumPhoto (FeedId, AlbumPhotoId, SortOrder)
            OUTPUT INSERTED.FeedId
            VALUES (@FeedId, @AlbumPhotoId, @SortOrder)
        ", conn);

            cmd.Parameters.AddWithValue("@FeedId", feedId);
            cmd.Parameters.AddWithValue("@AlbumPhotoId", photoId);
            cmd.Parameters.AddWithValue("@SortOrder", sortOrder);

            // INSERTED.FeedId를 ExecuteScalarAsync()로 가져온 뒤 int로 변환
            await cmd.ExecuteScalarAsync();

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in CreateFeedAsync: {ex.Message}");
            return false;
        }
    }
    
    public async Task<bool> CreateFeedAlbumShortAsync(int feedId, int shortId, int sortOrder)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            var cmd = new SqlCommand(@"
            INSERT INTO FeedAlbumShort (FeedId, ShortId, SortOrder)
            OUTPUT INSERTED.FeedAlbumShortId
            VALUES (@FeedId, @ShortId, @SortOrder)
        ", conn);

            cmd.Parameters.AddWithValue("@FeedId", feedId);
            cmd.Parameters.AddWithValue("@ShortId", shortId);
            cmd.Parameters.AddWithValue("@SortOrder", sortOrder);

            var insertedId = await cmd.ExecuteScalarAsync();

            // 정상적으로 INSERT 되면 insertedId에 auto increment된 FeedAlbumShortId가 반환됩니다.
            return insertedId != null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in CreateFeedAlbumShortAsync: {ex.Message}");
            return false;
        }
    }

    public Task<bool> UpdateLikeCountAsync(int feedId, int likeCount)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateCommentCountAsync(int feedId, int commentCount)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteFeedAsync(int feedId)
    {
        throw new NotImplementedException();
    }

    public async Task<List<FeedModel>> GetFeedsBySubscription(int userId)
    {
        var feeds = new List<FeedModel>();

        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            // Feed, AlbumSubscription, User, AlbumPhoto 테이블을 조인하여
            // 작성자의 Username과 앨범사진 ImageUrl도 함께 가져옴
            using var cmd = new SqlCommand(@"
                SELECT 
                    f.FeedId,
                    f.AlbumId,
                    f.CreatorUserId,
                    f.CreatedAt,
                    f.LikeCount,
                    f.CommentCount,
                    f.Body,
                    u.Username ,
                    u.ProfileImage
                FROM Feed f
                INNER JOIN AlbumSubscription s 
                    ON f.AlbumId = s.AlbumId
                LEFT JOIN [Users] u
                    ON u.UserId = f.CreatorUserId
                WHERE s.UserId = @UserId
                  AND s.IsActive = 1
                ORDER BY f.CreatedAt DESC
            ", conn);

            cmd.Parameters.AddWithValue("@UserId", userId);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var feed = new FeedModel
                {
                    FeedId         = reader.GetInt32(reader.GetOrdinal("FeedId")),
                    AlbumId        = reader.GetInt32(reader.GetOrdinal("AlbumId")),
                    CreatorUserId  = reader.GetInt32(reader.GetOrdinal("CreatorUserId")),
                    CreatedAt    = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    LikeCount      = reader.GetInt32(reader.GetOrdinal("LikeCount")),
                    CommentCount   = reader.GetInt32(reader.GetOrdinal("CommentCount")),
                    Body   = reader.GetString(reader.GetOrdinal("Body")),
                    Username = !reader.IsDBNull(reader.GetOrdinal("Username"))
                                       ? reader.GetString(reader.GetOrdinal("Username"))
                                       : null,
                    CreatorUserProfileImage = reader.GetString(reader.GetOrdinal("ProfileImage")),
                };
                feeds.Add(feed);
            }
        }
        catch (Exception ex)
        {
            // 로그 처리, 예외 처리
            Console.WriteLine($"Error in GetFeedsBySubscription: {ex.Message}");
        }

        return feeds;
    }

    public async Task<List<string>> GetFeedsAlbumPhotoAsync(int feedId)
    {
        var photoUrls = new List<string>();

        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            // FeedAlbumPhoto와 AlbumPhoto를 조인하여, 해당 FeedId에 속한 모든 PhotoUrl을 가져옴
            var query = @"
            SELECT p.PhotoUrl
            FROM FeedAlbumPhoto fap
            INNER JOIN AlbumPhoto p
                ON fap.AlbumPhotoId = p.AlbumPhotoId
            WHERE fap.FeedId = @FeedId
            ORDER BY fap.SortOrder
        ";

            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@FeedId", feedId);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                if (!reader.IsDBNull(0))
                {
                    var photoUrl = reader.GetString(0);
                    photoUrls.Add(photoUrl);
                }
            }
        }
        catch (Exception ex)
        {
            // 예외 처리(로그 등)
            Console.WriteLine($"GetFeedsAlbumPhotoAsync Error: {ex.Message}");
        }

        return photoUrls;
    }

    public async Task<List<string>> GetFeedsAlbumShortAsync(int feedId)
    {
        var shortUrls = new List<string>();

        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            // FeedAlbumShort와 AlbumShort를 조인하여, 해당 FeedId에 속한 모든 ShortUrl(또는 동영상 URL)을 가져옴
            var query = @"
                SELECT s.VideoUrl
                FROM FeedAlbumShort fas
                INNER JOIN AlbumShort s
                    ON fas.ShortId = s.ShortId
                WHERE fas.FeedId = @FeedId
                ORDER BY fas.SortOrder
            ";

            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@FeedId", feedId);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                if (!reader.IsDBNull(0))
                {
                    var shortUrl = reader.GetString(0);
                    shortUrls.Add(shortUrl);
                }
            }
        }
        catch (Exception ex)
        {
            // 예외 처리(로그 등)
            Console.WriteLine($"GetFeedsAlbumShortAsync Error: {ex.Message}");
        }

        return shortUrls;
    }

    public async Task<List<FeedMedia>> GetFeedMediasAsync(int feedId)
    {
        var mediaList = new List<FeedMedia>();

        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();
        
            // 사진과 쇼츠를 공통 형태로 불러오기
            var query = @"
                SELECT p.PhotoUrl AS Url, fap.SortOrder, 'photo' AS MediaType
                FROM FeedAlbumPhoto fap
                INNER JOIN AlbumPhoto p ON fap.AlbumPhotoId = p.AlbumPhotoId
                WHERE fap.FeedId = @FeedId

                UNION ALL

                SELECT s.VideoUrl AS Url, fas.SortOrder, 'short' AS MediaType
                FROM FeedAlbumShort fas
                INNER JOIN AlbumShort s ON fas.ShortId = s.ShortId
                WHERE fas.FeedId = @FeedId

                ORDER BY SortOrder;
            ";

            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@FeedId", feedId);

            using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                mediaList.Add(new FeedMedia
                {
                    FeedId = feedId,
                    Url = reader.GetString(reader.GetOrdinal("Url")),
                    SortOrder = reader.GetInt32(reader.GetOrdinal("SortOrder")),
                    MediaType = reader.GetString(reader.GetOrdinal("MediaType"))
                });
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetFeedMediasAsync error: {ex.Message}");
        }

        return mediaList;
    }

    public async Task<bool> ToggleLikeFeedAsync(int userId, int feedId)
    {
        try
            {
                using var conn = new SqlConnection(_connectionString);
                await conn.OpenAsync();

                // 1) 사용자가 이미 좋아요를 눌렀는지 확인
                using var checkCmd = new SqlCommand(@"
                    SELECT COUNT(1)
                    FROM FeedLikes
                    WHERE UserId = @UserId
                      AND FeedId = @FeedId
                ", conn);

                checkCmd.Parameters.AddWithValue("@UserId", userId);
                checkCmd.Parameters.AddWithValue("@FeedId", feedId);

                int isLiked = (int)await checkCmd.ExecuteScalarAsync();

                // 2) 이미 좋아요가 등록되어 있다면 => 해제 (DELETE) + LikeCount - 1
                // 없으면 => 등록 (INSERT) + LikeCount + 1
                if (isLiked > 0)
                {
                    // DELETE
                    using var deleteCmd = new SqlCommand(@"
                        DELETE FROM FeedLikes
                        WHERE UserId = @UserId
                          AND FeedId = @FeedId
                    ", conn);
                    deleteCmd.Parameters.AddWithValue("@UserId", userId);
                    deleteCmd.Parameters.AddWithValue("@FeedId", feedId);
                    await deleteCmd.ExecuteNonQueryAsync();

                    // LikeCount - 1
                    using var decreaseCmd = new SqlCommand(@"
                        UPDATE Feed
                        SET LikeCount = LikeCount - 1
                        WHERE FeedId = @FeedId
                    ", conn);
                    decreaseCmd.Parameters.AddWithValue("@FeedId", feedId);
                    await decreaseCmd.ExecuteNonQueryAsync();
                }
                else
                {
                    // INSERT
                    using var insertCmd = new SqlCommand(@"
                        INSERT INTO FeedLikes (UserId, FeedId)
                        VALUES (@UserId, @FeedId)
                    ", conn);
                    insertCmd.Parameters.AddWithValue("@UserId", userId);
                    insertCmd.Parameters.AddWithValue("@FeedId", feedId);
                    await insertCmd.ExecuteNonQueryAsync();

                    // LikeCount + 1
                    using var increaseCmd = new SqlCommand(@"
                        UPDATE Feed
                        SET LikeCount = LikeCount + 1
                        WHERE FeedId = @FeedId
                    ", conn);
                    increaseCmd.Parameters.AddWithValue("@FeedId", feedId);
                    await increaseCmd.ExecuteNonQueryAsync();
                }

                return true; // 성공 시 true
            }
            catch (Exception ex)
            {
                // 예외 처리 (로그 등)
                Console.WriteLine($"Error in ToggleLikeFeedAsync: {ex.Message}");
                return false;
            }
    }

    public async Task<bool> GetLikeFeedAsync(int userId, int feedId)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
            SELECT COUNT(1)
            FROM FeedLikes
            WHERE UserId = @UserId
              AND FeedId = @FeedId
        ", conn);

            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@FeedId", feedId);

            var count = (int)await cmd.ExecuteScalarAsync();
            return count > 0;
        }
        catch (Exception ex)
        {
            // 필요한 로그 처리
            Console.WriteLine($"Error in GetLikeFeedAsync: {ex.Message}");
            return false;
        }
    }

    public async Task<List<FeedCommentModel>> GetFeedCommentsAsync(int feedId)
    {
        var comments = new List<FeedCommentModel>();

        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                SELECT 
                    fc.CommentId,
                    fc.FeedId,
                    fc.UserId,
                    fc.Content,
                    fc.CreatedAt,
                    fc.UpdatedAt,
                    u.Username,
                    u.ProfileImage
                FROM FeedComment fc
                INNER JOIN Users u ON fc.UserId = u.UserId
                INNER JOIN Feed f ON fc.FeedId = f.FeedId
                WHERE fc.FeedId = @FeedId
            ", conn);

            cmd.Parameters.AddWithValue("@FeedId", feedId);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var comment = new FeedCommentModel()
                {
                    CommentId         = reader.GetInt32(reader.GetOrdinal("CommentId")),
                    FeedId        = reader.GetInt32(reader.GetOrdinal("FeedId")),
                    UserId  = reader.GetInt32(reader.GetOrdinal("UserId")),
                    Content   = reader.GetString(reader.GetOrdinal("Content")),
                    CreatedAt    = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    UpdatedAt      = !reader.IsDBNull(reader.GetOrdinal("UpdatedAt"))
                        ? reader.GetDateTime(reader.GetOrdinal("UpdatedAt"))
                        : null,
                    Username      = reader.GetString(reader.GetOrdinal("Username")),
                    ProfileImage      = !reader.IsDBNull(reader.GetOrdinal("ProfileImage"))
                        ? reader.GetString(reader.GetOrdinal("ProfileImage"))
                        : null,
                };
                comments.Add(comment);
            }
        }
        catch (Exception ex)
        {
            // 로그 처리, 예외 처리
            Console.WriteLine($"Error in GetFeedsBySubscription: {ex.Message}");
        }

        return comments;
    }

    public async Task<int> GetFeedCommentCountAsync(int feedId)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync();

            using var cmd = new SqlCommand(@"
                SELECT 
                    COUNT(*) AS CommentCount
                FROM FeedComment AS fc
                WHERE fc.FeedId = @FeedId;
            ", conn);

            cmd.Parameters.AddWithValue("@FeedId", feedId);

            var result = await cmd.ExecuteScalarAsync();
            if (result != null && int.TryParse(result.ToString(), out int commentCount))
            {
                return commentCount;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in GetFeedCommentCountAsync: {ex.Message}");
        }

        return 0;
    }

    public async Task<bool> AddFeedCommentAsync(int feedId, string content, int userId)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            await conn.OpenAsync().ConfigureAwait(false);

            // 1) 피드가 존재하는지 확인합니다.
            var checkFeedSql = @"
            SELECT COUNT(*)
            FROM Feed
            WHERE FeedId = @FeedId
        ";
            using (var checkCmd = new SqlCommand(checkFeedSql, conn))
            {
                checkCmd.Parameters.AddWithValue("@FeedId", feedId);
                var feedCount = (int)(await checkCmd.ExecuteScalarAsync().ConfigureAwait(false) ?? 0);

                if (feedCount == 0)
                {
                    // 피드가 존재하지 않는 경우 false 반환
                    return false;
                }
            }

            // 2) 댓글을 추가합니다.
            var insertCommentSql = @"
            INSERT INTO FeedComment (FeedId, UserId, Content)
            VALUES (@FeedId, @UserId, @Content)
        ";
            using (var insertCmd = new SqlCommand(insertCommentSql, conn))
            {
                insertCmd.Parameters.AddWithValue("@FeedId", feedId);
                insertCmd.Parameters.AddWithValue("@Content", content);
                insertCmd.Parameters.AddWithValue("@UserId", userId);

                var rowsAffected = await insertCmd.ExecuteNonQueryAsync().ConfigureAwait(false);
                if (rowsAffected == 0)
                {
                    // 댓글이 삽입되지 않았으므로 실패로 간주
                    return false;
                }
            }

            // 3) 피드의 댓글 수를 증가시킵니다.
            var updateFeedSql = @"
            UPDATE Feed
            SET CommentCount = CommentCount + 1
            WHERE FeedId = @FeedId
        ";
            using (var updateCmd = new SqlCommand(updateFeedSql, conn))
            {
                updateCmd.Parameters.AddWithValue("@FeedId", feedId);
                var rowsAffected = await updateCmd.ExecuteNonQueryAsync().ConfigureAwait(false);

                if (rowsAffected == 0)
                {
                    // 피드 댓글 수 갱신 실패로 간주
                    return false;
                }
            }

            // 모든 과정이 성공적으로 완료되면 true를 반환합니다.
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error in AddFeedCommentAsync: {ex.Message}");
            return false;
        }

    }
}