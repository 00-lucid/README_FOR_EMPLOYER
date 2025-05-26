
using MESALL.Shared.Models;

namespace MESALL.Shared.Interfaces;

public interface ILoginService
{
    public Task<AuthToken?> LoginAsync(string email, string password);
    public Task LogoutAsync();
    public Task<bool> SignupAsync(string username, string email, string password);
}