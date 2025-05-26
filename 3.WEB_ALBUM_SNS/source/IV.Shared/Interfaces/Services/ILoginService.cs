using IV.Shared.Model;

namespace IV.Web.Services;

public interface ILoginService
{
    public Task<UserModel?> LoginAsync(string email, string password);
    public Task LogoutAsync();
    public Task<bool> SignupAsync(string username, string email, string password);
}