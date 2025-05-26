using System.Security.Claims;
using MESALL.Shared.Models;

namespace MESALL.Shared.Helpers;

public class ClaimHelper
{
    /// <summary>
    /// User를 Claim으로 변환합니다.
    /// </summary>
    public static Claim[] ToClaims(int userId, string username, string email)
    {
        return
        [
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Name, username.ToString()),
            new Claim(ClaimTypes.Email, email.ToString())
        ];
    }
    
    /// <summary>
    /// Claim을 User로 변환합니다.
    /// </summary>
    public static User? FromClaimsPrincipal(ClaimsPrincipal principal)
    {
        if (principal.Identity?.IsAuthenticated is true)
        {
            var id = Convert.ToInt32(principal.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var name = principal.FindFirst(ClaimTypes.Name)!.Value;
            var email = principal.FindFirst(ClaimTypes.Email)!.Value;

            return null;
        }

        return null;
    }
}