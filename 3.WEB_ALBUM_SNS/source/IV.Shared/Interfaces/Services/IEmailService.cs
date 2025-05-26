namespace IV.Shared.Interfaces.Services;

/// <summary>
/// Provides email-related functionalities.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends an email asynchronously.
    /// </summary>
    /// <param name="to">Recipient email address.</param>
    /// <param name="subject">Subject of the email.</param>
    /// <param name="body">Content of the email.</param>
    /// <returns>A Task representing the asynchronous operation.</returns>
    Task SendAsync(string to, string subject, string body);

    /// <summary>
    /// Saves a verification code for later validation.
    /// </summary>
    /// <param name="email">The email address associated with the code.</param>
    /// <param name="code">The verification code to save.</param>
    void SaveVerificationCode(string email, string code);
    
    /// <summary>
    /// Validates a verification code against the stored value.
    /// </summary>
    /// <param name="code">The code to validate.</param>
    /// <returns><c>true</c> if the code is valid; otherwise, <c>false</c>.</returns>
    Task<bool> ValidateCodeAsync(string code);
}