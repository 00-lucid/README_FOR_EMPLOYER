namespace IV.Shared.Model;

public class FeedCommentModel
{
    public int CommentId { get; set; }
    public int FeedId { get; set; }
    public int UserId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    
    public required string Username { get; set; }

    public string ProfileImage { get; set; } = "https://ivblobstorage.blob.core.windows.net/images/default-profile.png";
}