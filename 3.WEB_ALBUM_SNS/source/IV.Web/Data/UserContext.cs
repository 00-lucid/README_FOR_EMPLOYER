using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;

namespace IV.Web.Data;

public class UserContext(IConfiguration configuration): IUserContext
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                                                throw new InvalidOperationException("DB connection string not found.");
    public async Task<bool> ResetPasswordAsync(string email, string password)
    {
        try
        {
            // SQL 연결 생성 및 열기
            await using SqlConnection connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // 1. 입력된 이메일로 사용자 존재 여부 확인
            string checkEmailQuery = "SELECT COUNT(*) FROM Users WHERE Email = @Email";
            await using SqlCommand checkCommand = new SqlCommand(checkEmailQuery, connection);
            checkCommand.Parameters.AddWithValue("@Email", email);

            int userExists = (int)(await checkCommand.ExecuteScalarAsync() ?? throw new InvalidOperationException());
            if (userExists == 0)
            {
                Console.WriteLine("ResetPassword failed: No user exists with the provided email.");
                return false;
            }

            // 2. 새 비밀번호를 해시화
            var passwordHasher = new PasswordHasher<object>();
            string hashedPassword = passwordHasher.HashPassword(null, password);

            // 3. 패스워드 업데이트 쿼리
            string updatePasswordQuery = @"
                UPDATE Users
                SET PasswordHash = @PasswordHash
                WHERE Email = @Email";

            await using SqlCommand updateCommand = new SqlCommand(updatePasswordQuery, connection);
            updateCommand.Parameters.AddWithValue("@PasswordHash", hashedPassword);
            updateCommand.Parameters.AddWithValue("@Email", email);

            // 4. 업데이트 수행
            int rowsAffected = await updateCommand.ExecuteNonQueryAsync();

            // 5. 업데이트가 성공적으로 이루어지지 않은 경우 처리
            if (rowsAffected == 0)
            {
                Console.WriteLine("ResetPassword failed: Failed to update the password in the database.");
                return false;
            }

            // 성공적으로 패스워드 변경 완료
            Console.WriteLine("Password successfully reset.");
            return true;
        }
        catch (SqlException sqlEx)
        {
            // 데이터베이스 관련 예외 처리
            Console.WriteLine($"Database error occurred during password reset: {sqlEx.Message}");
            return false;
        }
        catch (Exception ex)
        {
            // 일반적인 예외 처리
            Console.WriteLine($"An error occurred during password reset: {ex.Message}");
            return false;
        }
    }

    public async Task<List<UserModel>> SearchUsersAsync(string keyword)
    {
        var users = new List<UserModel>();

        try
        {
            // SQL 연결 생성 및 열기
            await using SqlConnection connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // 간단한 예시로, Username이나 Email에 keyword 문자열이 포함된 경우 조회
            string query = @"
                    SELECT UserId, Username, Email 
                    FROM Users
                    WHERE Username LIKE '%' + @Keyword + '%' 
                       OR Email LIKE '%' + @Keyword + '%'";

            await using SqlCommand command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@Keyword", keyword ?? string.Empty);

            await using SqlDataReader reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var user = new UserModel
                {
                    UserId = reader.GetInt32(0),
                    Username = reader.GetString(1),
                    Email = reader.GetString(2)
                };
                users.Add(user);
            }
        }
        catch (SqlException sqlEx)
        {
            Console.WriteLine($"Database error occurred during user search: {sqlEx.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred during user search: {ex.Message}");
        }

        return users;
    }

    public async Task<UserModel> GetCurrentUserAsync(int userId)
    {
        try
        {
            // SQL 연결 생성 및 열기
            await using SqlConnection connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // 간단한 예시로, Username이나 Email에 keyword 문자열이 포함된 경우 조회
            string query = @"
                    SELECT UserId, Username, Email, ProfileImage, BackgroundImage
                    FROM Users
                    WHERE UserId = @UserId";

            await using SqlCommand command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@UserId", userId);

            await using SqlDataReader reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var user = new UserModel
                {
                    UserId = reader.GetInt32(0),
                    Username = reader.GetString(1),
                    Email = reader.GetString(2),
                    ProfileImage = reader.GetString(3),
                    BackgroundImage = reader.GetString(4)
                };

                return user;
            }
        }
        catch (SqlException sqlEx)
        {
            Console.WriteLine($"Database error occurred during user search: {sqlEx.Message}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred during user search: {ex.Message}");
        }

        return null;
    }

    public async Task<UserModel> UpdateProfileAsync(int userId, string fileUri)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            // 예: User 테이블의 ProfileImageUrl 컬럼을 업데이트하는 구문
            // 컬럼/테이블 이름은 실제 DB 구조에 맞춰 변경 필요
            using var cmd = new SqlCommand(@"
                UPDATE [Users]
                SET ProfileImage = @ProfileImage
                WHERE UserId = @UserId
            ", conn);

            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@ProfileImage", fileUri);

            await conn.OpenAsync();
            var rowsAffected = await cmd.ExecuteNonQueryAsync();

            // 업데이트가 성공했다면 수정된 사용자 정보를 다시 조회(또는 
            // UserModel을 새로 만들어 반환)
            if (rowsAffected > 0)
            {
                // 예: GetCurrentUserAsync로 다시 조회
                var updatedUser = await GetCurrentUserAsync(userId);
                return updatedUser;
            }
            else
            {
                // 업데이트되지 않았다면 null을 반환하거나, 예외 처리
                return null;
            }
        }
        catch (Exception ex)
        {
            // 로그 처리 등
            Console.WriteLine(ex.Message);
            // 에러 시에는 null 또는 적절한 예외 처리
            return null;
        }
    }

    public async Task<UserModel> UpdateBackgroundAsync(int userId, string fileUri)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            // 예: User 테이블의 ProfileImageUrl 컬럼을 업데이트하는 구문
            // 컬럼/테이블 이름은 실제 DB 구조에 맞춰 변경 필요
            using var cmd = new SqlCommand(@"
                UPDATE [Users]
                SET BackgroundImage = @BackgroundImage
                WHERE UserId = @UserId
            ", conn);

            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@BackgroundImage", fileUri);

            await conn.OpenAsync();
            var rowsAffected = await cmd.ExecuteNonQueryAsync();

            // 업데이트가 성공했다면 수정된 사용자 정보를 다시 조회(또는 
            // UserModel을 새로 만들어 반환)
            if (rowsAffected > 0)
            {
                // 예: GetCurrentUserAsync로 다시 조회
                var updatedUser = await GetCurrentUserAsync(userId);
                return updatedUser;
            }
            else
            {
                // 업데이트되지 않았다면 null을 반환하거나, 예외 처리
                return null;
            }
        }
        catch (Exception ex)
        {
            // 로그 처리 등
            Console.WriteLine(ex.Message);
            // 에러 시에는 null 또는 적절한 예외 처리
            return null;
        }
    }
}