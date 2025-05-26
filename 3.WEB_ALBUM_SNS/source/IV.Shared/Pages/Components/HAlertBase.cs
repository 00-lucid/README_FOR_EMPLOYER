using Microsoft.AspNetCore.Components;

namespace IV.Shared.Pages.Components;

public class HAlertBase : ComponentBase
{
    protected List<HAlertModel> Alerts { get; set; } = new();

    /// <summary>
    /// 새 알림을 목록에 추가하고 렌더링 갱신
    /// </summary>
    public void ShowAlert(HAlertModel alert)
    {
        Alerts.Add(alert);
        StateHasChanged();
    }

    /// <summary>
    /// 특정 알림을 목록에서 제거
    /// </summary>
    public void DismissAlertById(Guid alertId)
    {
        var found = Alerts.FirstOrDefault(a => a.Id == alertId);
        if (found is not null)
        {
            Alerts.Remove(found);
            StateHasChanged();
        }
    }

}

/// <summary>
/// 여러 알림 정보를 관리하기 위한 모델 예시
/// </summary>
public class HAlertModel
{
    public Guid Id { get; set; } = Guid.NewGuid(); // 고유 ID 
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public HAlert.AlertType Type { get; set; } = HAlert.AlertType.Information;
    public int Duration { get; set; } = 3000;
}