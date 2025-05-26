namespace IV.Shared.Model;

public class EmailInvitationModel
{
    public int Id { get; set; }

    public string? RecipientEmail { get; set; }

    public Guid InvitationToken { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime ExpiresAt { get; set; }

    public bool IsUsed { get; set; }

    public int SenderId { get; set; }
    
    public string InvitationStatus { get; set; }
}