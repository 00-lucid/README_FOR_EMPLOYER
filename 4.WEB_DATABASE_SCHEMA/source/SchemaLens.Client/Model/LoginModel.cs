namespace SchemaLens.Client.Model
{
    public class LoginModel
    {
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public DateTime LastLoginAt { get; set; }
    }
}
