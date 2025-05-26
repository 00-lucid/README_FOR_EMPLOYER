using IV.Shared.Model;

namespace IV.Shared.Interfaces.Services;

public interface IAlarmService
{
    Task CreateAlarm(int userId, string type, string message);
    Task<List<AlarmModel>> GetAlarmsByUserId(int userId);
    Task UpdateAlarmReadByAlarmId(int alarmId);
}