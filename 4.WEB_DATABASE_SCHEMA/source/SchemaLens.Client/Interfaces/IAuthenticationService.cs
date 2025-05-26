namespace SchemaLens.Client.Interfaces
{
    public interface IAuthenticationService
    {
        Task<bool> Login(string username, string password);
        Task Logout();
    }
}
