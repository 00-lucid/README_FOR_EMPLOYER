using IV.Shared.Model;

namespace IV.Shared.Interfaces.Services;

public interface IUserService
{
    /// <summary>
    /// Resets the password for a user account.
    /// </summary>
    /// <param name="email">The user's email address.</param>
    /// <param name="newPassword">The new password to set.</param>
    /// <returns>A Task representing the asynchronous operation.</returns>
    Task<bool> ResetPasswordAsync(string email, string newPassword);
    
    /// <summary>
    /// Searches for users based on a given keyword (e.g., username, part of name, etc.).
    /// </summary>
    /// <param name="keyword">The keyword to filter users by.</param>
    /// <returns>A list of users matching the keyword.</returns>
    Task<List<UserModel>> SearchUsersAsync(string keyword);

    /// <summary>
    /// Retrieves the currently logged-in user's information.
    /// </summary>
    /// <returns>The current user's UserModel object.</returns>
    Task<UserModel> GetCurrentUserAsync(int userId);
    
    Task<UserModel> UpdateProfileAsync(int userId, string fileUri);
    
    Task<int> GetUserIdAsync();
    
    Task<UserModel> UpdateBackgroundAsync(int userId, string fileUri);

    Task<string> GetUserNameAsync();

    public Task<bool> IsLoggedInAsync();
}
