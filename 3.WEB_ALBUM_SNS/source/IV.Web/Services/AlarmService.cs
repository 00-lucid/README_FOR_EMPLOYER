using IV.Shared.Interfaces.Data;
using IV.Shared.Interfaces.Services;
using IV.Shared.Model;
using IV.Web.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace IV.Web.Services;

public class AlarmService(
    IAlarmContext alarmContext,
    IHubContext<AlarmHub> _hubContext
    ): IAlarmService
{
    public Task CreateAlarm(int userId, string type, string message)
    {
        alarmContext.CreateAlarm(userId,type, message);
        _hubContext.Clients.All.SendAsync("ReceiveAlarmUpdate");
        
        return Task.CompletedTask;
    }

    public Task<List<AlarmModel>> GetAlarmsByUserId(int userId)
    {
        return alarmContext.GetAlarmsByUserId(userId);
    }

    public Task UpdateAlarmReadByAlarmId(int alarmId)
    {
        alarmContext.UpdateAlarmReadByAlarmId(alarmId);
        _hubContext.Clients.All.SendAsync("ReceiveAlarmUpdate");
        
        return Task.CompletedTask;
    }
}