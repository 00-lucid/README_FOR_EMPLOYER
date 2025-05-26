using IV.Shared.Model;

namespace IV.Shared.Interfaces.Data;

public interface ILoginContext
{
    Task<UserModel?> LoginAsync(string username, string password);
    Task<bool> SignupAsync(string username, string email, string password);
}