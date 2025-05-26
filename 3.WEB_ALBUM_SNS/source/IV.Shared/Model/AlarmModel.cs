namespace IV.Shared.Model;

public class AlarmModel
{
    public int AlarmId { get; set; }
    public int UserId { get; set; }
    public string? AlarmType { get; set; }
    public string? Message { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsRead { get; set; }
}