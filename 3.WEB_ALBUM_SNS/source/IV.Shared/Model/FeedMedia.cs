namespace IV.Shared.Model;

public class FeedMedia
{
    public int FeedId { get; set; }                              // 연결된 Feed Id
    public string MediaType { get; set; } = null!;              // 'photo' 또는 'short'
    public string Url { get; set; } = null!;                    // 실제 미디어 URL
    public int SortOrder { get; set; }                           // 표시 순서
}