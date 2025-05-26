namespace IV.Shared.Model;

public class AlbumMedia
{
    public int MediaId { get; set; }
    public string MediaType { get; set; } = string.Empty;  // "photo" or "short"
    public string Url { get; set; } = string.Empty;        // 미디어의 URL
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  // 미디어가 생성된 날짜시간
}