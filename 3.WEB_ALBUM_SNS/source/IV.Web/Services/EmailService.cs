using System.Collections.Concurrent;
using System.Net;
using System.Net.Mail;
using IV.Shared.Interfaces;
using IV.Shared.Interfaces.Services;

namespace IV.Web.Services;

public class EmailService : IEmailService
{
    private readonly EmailServiceSettings _settings;

    // In-memory storage for verification codes (thread-safe)
    private static readonly ConcurrentDictionary<string, string> VerificationCodes = new();

    /// <summary>
    /// Initializes a new instance of the EmailService class.
    /// </summary>
    /// <param name="settings">Email service configuration settings.</param>
    public EmailService(EmailServiceSettings settings)
    {
        _settings = settings;
    }

    /// <summary>
    /// Sends an email asynchronously using SMTP.
    /// </summary>
    /// <param name="to">Recipient email address.</param>
    /// <param name="subject">Subject of the email.</param>
    /// <param name="body">Content of the email.</param>
    /// <returns>A Task that represents the asynchronous operation.</returns>
    public async Task SendAsync(string to, string subject, string body)
    {
        using var smtpClient = new SmtpClient(_settings.SmtpHost, _settings.SmtpPort)
        {
            Credentials = new NetworkCredential(_settings.SmtpUser, _settings.SmtpPassword),
            EnableSsl = _settings.EnableSsl
        };

        var mailMessage = new MailMessage
        {
            From = new MailAddress(_settings.FromEmail, _settings.FromDisplayName),
            Subject = subject,
            Body = body,
            IsBodyHtml = true // To allow HTML-based emails
        };

        mailMessage.To.Add(to);

        try
        {
            await smtpClient.SendMailAsync(mailMessage);
        }
        catch (Exception ex)
        {
            // Logging and error management can be added here
            throw new InvalidOperationException($"Failed to send email to {to}.", ex);
        }
    }

    /// <summary>
    /// Saves a verification code for later validation.
    /// </summary>
    /// <param name="email">The email address associated with the code.</param>
    /// <param name="code">The verification code to save.</param>
    public void SaveVerificationCode(string email, string code)
    {
        // Store the code in memory and associate it with the email
        VerificationCodes[email] = code;

        // Optionally, you could also add an expiration timer for the code
    }

    /// <summary>
    /// Validates a verification code against the stored value.
    /// </summary>
    /// <param name="code">The code to validate.</param>
    /// <returns><c>true</c> if the code is valid; otherwise, <c>false</c>.</returns>
    public async Task<bool> ValidateCodeAsync(string code)
    {
        await Task.Delay(0); // Simulate asynchronous operation for potential future database calls

        // Find email by code
        var email = VerificationCodes.FirstOrDefault(pair => pair.Value == code).Key;

        // If the code exists and is valid, remove it after validation
        if (email != null)
        {
            VerificationCodes.TryRemove(email, out _); // Remove the entry after successful validation
            return true;
        }

        return false;
    }
}

    /// <summary>
    /// Settings for EmailService.
    /// </summary>
    public class EmailServiceSettings
    {
        public string SmtpHost { get; set; } = string.Empty;
        public int SmtpPort { get; set; }
        public string SmtpUser { get; set; } = string.Empty;
        public string SmtpPassword { get; set; } = string.Empty;
        public bool EnableSsl { get; set; }
        public string FromEmail { get; set; } = string.Empty;
        public string FromDisplayName { get; set; } = "IV Support";
    }
