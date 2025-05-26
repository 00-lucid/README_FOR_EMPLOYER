using IV.Shared.Model;

namespace IV.Shared.Interfaces.Data;

public interface IAlarmContext
{
    Task CreateAlarm(int userId, string type, string message);
    Task<List<AlarmModel>> GetAlarmsByUserId(int userId);
    Task UpdateAlarmReadByAlarmId(int alarmId);
}