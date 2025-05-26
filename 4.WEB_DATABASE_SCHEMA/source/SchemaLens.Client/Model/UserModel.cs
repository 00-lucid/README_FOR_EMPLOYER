namespace SchemaLens.Client.Model;

public class UserModel
{
    public int UserId{ get; set; }
    public string Username{ get; set; }
    public string Email{ get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastLoginAt { get; set; }
    public string Authority { get; set; }
    public string Name { get; set; }
}