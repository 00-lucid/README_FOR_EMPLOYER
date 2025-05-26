using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;

namespace IV.Web.Data;

public class LoginContext(IConfiguration configuration): ILoginContext
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                                                throw new InvalidOperationException("DB connection string not found.");
    public async Task<UserModel?> LoginAsync(string email, string password)
    {
        try
        {
            // SQL 연결 생성 및 열기
            await using SqlConnection connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // 1. 사용자 정보 및 비밀번호 해시를 가져오는 쿼리
            string query = @"SELECT UserId, Username, Email, PasswordHash, CreatedAt FROM Users WHERE Email = @Email";
            await using SqlCommand command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@Email", email);

            // 2. 데이터 읽기
            await using SqlDataReader reader = await command.ExecuteReaderAsync();

            if (await reader.ReadAsync())
            {
                // 사용자 정보 할당
                int userId = reader.GetInt32(reader.GetOrdinal("UserId"));
                string username = reader.GetString(reader.GetOrdinal("Username"));
                string dbEmail = reader.GetString(reader.GetOrdinal("Email"));
                string storedPasswordHash = reader.GetString(reader.GetOrdinal("PasswordHash"));
                DateTime createdAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt"));

                // 3. 비밀번호 검증
                var passwordHasher = new PasswordHasher<object>();
                string test = passwordHasher.HashPassword(null, password);
                var verifyResult = passwordHasher.VerifyHashedPassword(null, storedPasswordHash, password);

                if (verifyResult == PasswordVerificationResult.Success)
                {
                    // 비밀번호가 유효하므로 UserModel 반환
                    return new UserModel
                    {
                        UserId = userId,
                        Username = username,
                        Email = dbEmail,
                        PasswordHash = storedPasswordHash,
                        CreatedAt = createdAt
                    };
                }
                else
                {
                    // 비밀번호가 틀림
                    return null;
                }
            }
            else
            {
                // 사용자 이름이 존재하지 않음
                return null;
            }
        }
        catch (SqlException ex)
        {
            // TODO: 예외 상황 로깅 처리
            Console.WriteLine($"Database error occurred: {ex.Message}");
            return null;
        }
        catch (Exception ex)
        {
            // TODO: 일반적인 예외 처리
            Console.WriteLine($"An error occurred: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> SignupAsync(string username, string email, string password)
    {
        try
        {
            // SQL 연결 생성 및 열기
            await using SqlConnection connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();

            // 1. 이메일 중복 확인
            string checkEmailQuery = "SELECT COUNT(*) FROM Users WHERE Email = @Email";
            await using SqlCommand checkCommand = new SqlCommand(checkEmailQuery, connection);
            checkCommand.Parameters.AddWithValue("@Email", email);

            int existingEmailCount = (int)await checkCommand.ExecuteScalarAsync();
            if (existingEmailCount > 0)
            {
                // 이메일이 이미 사용 중이라면 false 반환
                Console.WriteLine("Signup failed: The email is already registered.");
                return false;
            }

            // 2. 비밀번호 해시 생성
            var passwordHasher = new PasswordHasher<object>();
            string hashedPassword = passwordHasher.HashPassword(null, password);

            // 3. 사용자를 데이터베이스에 추가하는 SQL 쿼리
            string query = @"
                INSERT INTO Users (Username, Email, PasswordHash, CreatedAt)
                VALUES (@Username, @Email, @PasswordHash, @CreatedAt)";

            await using SqlCommand command = new SqlCommand(query, connection);
            command.Parameters.AddWithValue("@Username", username);
            command.Parameters.AddWithValue("@Email", email);
            command.Parameters.AddWithValue("@PasswordHash", hashedPassword);
            command.Parameters.AddWithValue("@CreatedAt", DateTime.UtcNow);

            // 4. 명령 실행
            int rowsAffected = await command.ExecuteNonQueryAsync();

            // 삽입된 행이 없으면 실패를 반환
            if (rowsAffected == 0)
            {
                Console.WriteLine("Signup failed: Failed to insert the user into the database.");
                return false;
            }

            // 성공적으로 가입 처리
            return true;
        }
        catch (SqlException sqlEx)
        {
            // 데이터베이스 관련 예외 처리
            Console.WriteLine($"Database error occurred during signup: {sqlEx.Message}");
            return false;
        }
        catch (Exception ex)
        {
            // 일반적인 예외 처리
            Console.WriteLine($"An error occurred during signup: {ex.Message}");
            return false;
        }
    }
}