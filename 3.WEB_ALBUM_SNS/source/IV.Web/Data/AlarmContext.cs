using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using Microsoft.Data.SqlClient;

namespace IV.Web.Data;

public class AlarmContext(
    IConfiguration configuration
    ): IAlarmContext
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection") ?? 
                                                throw new InvalidOperationException("DB connection string not found.");

    public async Task CreateAlarm(int userId, string type, string message)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                INSERT INTO Alarm (UserId, AlarmType, Message)
                VALUES (@UserId, @AlarmType, @Message);
            ", conn);

            cmd.Parameters.AddWithValue("@UserId", userId);
            cmd.Parameters.AddWithValue("@AlarmType", type);
            cmd.Parameters.AddWithValue("@Message", message);

            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }
        catch (SqlException sqlEx)
        {
            Console.WriteLine($"Database error occurred during alarm creation: {sqlEx.Message}");
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred during alarm creation: {ex.Message}");
            throw;
        }
    }

    public async Task<List<AlarmModel>> GetAlarmsByUserId(int userId)
    {
        try
        {
            var alarms = new List<AlarmModel>();

            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
                SELECT 
                    AlarmId,
                    UserId,
                    AlarmType,
                    Message,
                    CreatedAt,
                    IsRead
                FROM Alarm
                WHERE UserId = @UserId
                ORDER BY CreatedAt DESC
            ", conn);
            
            cmd.Parameters.AddWithValue("@UserId", userId);

            await conn.OpenAsync();

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                // AlbumModel로 매핑
                var alarm = new AlarmModel()
                {
                    AlarmId = reader.GetInt32(reader.GetOrdinal("AlarmId")),
                    UserId = reader.GetInt32(reader.GetOrdinal("UserId")),
                    AlarmType = reader.GetString(reader.GetOrdinal("AlarmType")),
                    Message = reader.GetString(reader.GetOrdinal("Message")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    IsRead = reader.GetBoolean(reader.GetOrdinal("IsRead")),
                };
                alarms.Add(alarm);
            }

            return alarms;
        } catch (SqlException sqlEx) {
            Console.WriteLine($"Database error occurred during user search: {sqlEx.Message}");
            throw;
        } catch (Exception ex) {
            Console.WriteLine($"An error occurred during user search: {ex.Message}");
            throw;
        }
    }

    public async Task UpdateAlarmReadByAlarmId(int alarmId)
    {
        try
        {
            using var conn = new SqlConnection(_connectionString);
            using var cmd = new SqlCommand(@"
            UPDATE Alarm
            SET IsRead = 1
            WHERE AlarmId = @AlarmId
        ", conn);

            cmd.Parameters.AddWithValue("@AlarmId", alarmId);

            await conn.OpenAsync();
            await cmd.ExecuteNonQueryAsync();
        }
        catch (SqlException sqlEx)
        {
            Console.WriteLine($"Database error occurred during alarm update: {sqlEx.Message}");
            throw;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An error occurred during alarm update: {ex.Message}");
            throw;
        }
    }
}