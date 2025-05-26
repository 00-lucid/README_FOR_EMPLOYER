namespace MESALL.Shared.Models;

public class AuthToken
{
    /// <summary>
    /// 사용자 액세스 토큰.
    /// </summary>
    public string AccessToken { get; set; }
    
    /// <summary>
    /// 사용자 리프레시 토큰.
    /// </summary>
    public string RefreshToken { get; set; }
    
    /// <summary>
    /// 사용자 액세스 토큰 만료.
    /// </summary>
    public long AccessTokenExpiresIn { get; set; }
    
    /// <summary>
    /// 사용자의 리프레시 토큰 만료.
    /// </summary>
    public long RefreshTokenExpiresIn { get; set; }
}