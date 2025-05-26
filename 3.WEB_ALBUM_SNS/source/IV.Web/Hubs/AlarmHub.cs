using Microsoft.AspNetCore.SignalR;

namespace IV.Web.Hubs;

public class AlarmHub : Hub
{
    // 클라이언트로 특정 메시지를 보낼 때 호출
    public async Task SendAlarmUpdate()
    {
        await Clients.All.SendAsync("ReceiveAlarmUpdate");
    }
}