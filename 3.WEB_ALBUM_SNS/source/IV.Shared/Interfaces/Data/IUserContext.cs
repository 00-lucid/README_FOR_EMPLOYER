using IV.Shared.Model;

namespace IV.Shared.Interfaces.Data;

public interface IUserContext
{
    Task<bool> ResetPasswordAsync(string email, string password);
    
    Task<List<UserModel>> SearchUsersAsync(string keyword);
    
    Task<UserModel> GetCurrentUserAsync(int userId);
    
    Task<UserModel> UpdateProfileAsync(int userId, string fileUri);
    
    Task<UserModel> UpdateBackgroundAsync(int userId, string fileUri);
}