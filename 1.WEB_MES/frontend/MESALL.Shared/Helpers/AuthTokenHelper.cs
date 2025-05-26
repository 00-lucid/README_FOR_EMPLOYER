using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MESALL.Shared.Models;
using Microsoft.IdentityModel.Tokens;

namespace MESALL.Shared.Helpers;

/// <summary>
/// JWT 액세스 토큰 및 리프레시 토큰 관리를 위한 헬퍼 클래스
/// </summary>
public class AuthTokenHelper
{
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;

    /// <summary>
    /// 기본 생성자
    /// </summary>
    /// <param name="secretKey">JWT 서명용 비밀 키</param>
    /// <param name="issuer">토큰 발급자</param>
    /// <param name="audience">토큰 대상자</param>
    public AuthTokenHelper(string secretKey, string issuer = "yourApplication", string audience = "yourApi")
    {
        _secretKey = secretKey;
        _issuer = issuer;
        _audience = audience;
    }

    /// <summary>
    /// AuthToken 객체에서 액세스 토큰 검증 및 사용자 정보 추출
    /// </summary>
    /// <param name="authToken">AuthToken 객체</param>
    /// <returns>검증된 User 객체 또는 null</returns>
    public User? ValidateAccessToken(AuthToken authToken)
    {
        return ValidateToken(authToken.AccessToken);
    }

    /// <summary>
    /// JWT 토큰 검증 및 파싱
    /// </summary>
    /// <param name="token">JWT 토큰 문자열</param>
    /// <returns>검증된 User 객체 또는 null</returns>
    public User? ValidateToken(string token)
    {
        if (string.IsNullOrEmpty(token))
            return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_secretKey);

        try
        {
            // 토큰 검증
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            // JWT 토큰에서 클레임 추출
            var jwtToken = (JwtSecurityToken)validatedToken;
            
            // User 객체 생성
            var user = new User
            {
                UserId = int.Parse(jwtToken.Claims.First(x => x.Type == "userId").Value),
                CompanyId = int.Parse(jwtToken.Claims.First(x => x.Type == "companyId").Value),
                Username = jwtToken.Claims.FirstOrDefault(x => x.Type == "username")?.Value,
                Email = jwtToken.Claims.First(x => x.Type == "email").Value
            };

            // 날짜 정보가 있을 경우 설정
            if (DateTime.TryParse(jwtToken.Claims.FirstOrDefault(x => x.Type == "createdAt")?.Value, out DateTime createdAt))
            {
                user.CreatedAt = createdAt;
            }
            
            if (DateTime.TryParse(jwtToken.Claims.FirstOrDefault(x => x.Type == "updatedAt")?.Value, out DateTime updatedAt))
            {
                user.UpdatedAt = updatedAt;
            }

            return user;
        }
        catch
        {
            // 토큰 검증 실패
            return null;
        }
    }

    /// <summary>
    /// AuthToken의 액세스 토큰 만료 여부 확인
    /// </summary>
    /// <param name="authToken">AuthToken 객체</param>
    /// <returns>만료 여부</returns>
    public bool IsAccessTokenExpired(AuthToken authToken)
    {
        if (authToken == null || string.IsNullOrEmpty(authToken.AccessToken))
            return true;

        // Unix 타임스탬프로 설정된 만료 시간 확인
        var expirationTime = DateTimeOffset.FromUnixTimeSeconds(authToken.AccessTokenExpiresIn).UtcDateTime;
        return expirationTime <= DateTime.UtcNow;
    }

    /// <summary>
    /// AuthToken의 리프레시 토큰 만료 여부 확인
    /// </summary>
    /// <param name="authToken">AuthToken 객체</param>
    /// <returns>만료 여부</returns>
    public bool IsRefreshTokenExpired(AuthToken authToken)
    {
        if (authToken == null || string.IsNullOrEmpty(authToken.RefreshToken))
            return true;

        // Unix 타임스탬프로 설정된 만료 시간 확인
        var expirationTime = DateTimeOffset.FromUnixTimeSeconds(authToken.RefreshTokenExpiresIn).UtcDateTime;
        return expirationTime <= DateTime.UtcNow;
    }

    /// <summary>
    /// JWT 토큰의 만료 여부 확인
    /// </summary>
    /// <param name="token">JWT 토큰 문자열</param>
    /// <returns>만료 여부</returns>
    public bool IsTokenExpired(string token)
    {
        if (string.IsNullOrEmpty(token))
            return true;

        var tokenHandler = new JwtSecurityTokenHandler();
        if (!tokenHandler.CanReadToken(token))
            return true;

        var jwtToken = tokenHandler.ReadJwtToken(token);
        var expiration = jwtToken.ValidTo;
        
        return expiration < DateTime.UtcNow;
    }

    /// <summary>
    /// 토큰으로부터 만료 시간 가져오기
    /// </summary>
    /// <param name="token">JWT 토큰 문자열</param>
    /// <returns>만료 시간 또는 null</returns>
    public DateTime? GetTokenExpirationTime(string token)
    {
        if (string.IsNullOrEmpty(token))
            return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        if (!tokenHandler.CanReadToken(token))
            return null;

        var jwtToken = tokenHandler.ReadJwtToken(token);
        return jwtToken.ValidTo;
    }

    /// <summary>
    /// 토큰 내의 특정 클레임 값 추출
    /// </summary>
    /// <param name="token">JWT 토큰 문자열</param>
    /// <param name="claimType">가져올 클레임 타입</param>
    /// <returns>클레임 값 또는 null</returns>
    public string? GetClaimValue(string token, string claimType)
    {
        if (string.IsNullOrEmpty(token))
            return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        if (!tokenHandler.CanReadToken(token))
            return null;

        var jwtToken = tokenHandler.ReadJwtToken(token);
        return jwtToken.Claims.FirstOrDefault(x => x.Type == claimType)?.Value;
    }

    /// <summary>
    /// 토큰에서 모든 클레임 추출
    /// </summary>
    /// <param name="token">JWT 토큰 문자열</param>
    /// <returns>클레임 딕셔너리 또는 null</returns>
    public Dictionary<string, string>? GetAllClaims(string token)
    {
        if (string.IsNullOrEmpty(token))
            return null;

        var tokenHandler = new JwtSecurityTokenHandler();
        if (!tokenHandler.CanReadToken(token))
            return null;

        var jwtToken = tokenHandler.ReadJwtToken(token);
        return jwtToken.Claims.ToDictionary(c => c.Type, c => c.Value);
    }
    
    /// <summary>
    /// 토큰으로부터 사용자 ID 추출
    /// </summary>
    /// <param name="token">JWT 토큰 문자열</param>
    /// <returns>사용자 ID 또는 null</returns>
    public int? GetUserId(string token)
    {
        var userIdStr = GetClaimValue(token, "userId");
        if (int.TryParse(userIdStr, out int userId))
            return userId;
        
        return null;
    }
    
    /// <summary>
    /// 토큰으로부터 회사 ID 추출
    /// </summary>
    /// <param name="token">JWT 토큰 문자열</param>
    /// <returns>회사 ID 또는 null</returns>
    public int? GetCompanyId(string token)
    {
        var companyIdStr = GetClaimValue(token, "companyId");
        if (int.TryParse(companyIdStr, out int companyId))
            return companyId;
        
        return null;
    }
    
    /// <summary>
    /// 액세스 토큰으로부터 사용자 ID 추출
    /// </summary>
    /// <param name="authToken">AuthToken 객체</param>
    /// <returns>사용자 ID 또는 null</returns>
    public int? GetUserId(AuthToken authToken)
    {
        if (authToken == null || string.IsNullOrEmpty(authToken.AccessToken))
            return null;
            
        return GetUserId(authToken.AccessToken);
    }
    
    /// <summary>
    /// 액세스 토큰으로부터 회사 ID 추출
    /// </summary>
    /// <param name="authToken">AuthToken 객체</param>
    /// <returns>회사 ID 또는 null</returns>
    public int? GetCompanyId(AuthToken authToken)
    {
        if (authToken == null || string.IsNullOrEmpty(authToken.AccessToken))
            return null;
            
        return GetCompanyId(authToken.AccessToken);
    }
    
    /// <summary>
    /// AuthToken 객체가 유효한지 확인
    /// </summary>
    /// <param name="authToken">검증할 AuthToken 객체</param>
    /// <returns>유효성 여부</returns>
    public bool IsAuthTokenValid(AuthToken authToken)
    {
        if (authToken == null || 
            string.IsNullOrEmpty(authToken.AccessToken) || 
            string.IsNullOrEmpty(authToken.RefreshToken))
            return false;
            
        // 액세스 토큰이 유효한지 확인
        return !IsAccessTokenExpired(authToken);
    }
    
    /// <summary>
    /// AuthToken의 리프레시가 필요한지 확인
    /// </summary>
    /// <param name="authToken">AuthToken 객체</param>
    /// <returns>리프레시 필요 여부</returns>
    public bool NeedsRefresh(AuthToken authToken)
    {
        if (authToken == null || 
            string.IsNullOrEmpty(authToken.AccessToken) || 
            string.IsNullOrEmpty(authToken.RefreshToken))
            return true;
            
        // 액세스 토큰은 만료되었지만 리프레시 토큰은 유효한 경우
        return IsAccessTokenExpired(authToken) && !IsRefreshTokenExpired(authToken);
    }
    
    /// <summary>
    /// AuthToken이 완전히 만료되었는지 확인 (로그인 필요)
    /// </summary>
    /// <param name="authToken">AuthToken 객체</param>
    /// <returns>완전 만료 여부</returns>
    public bool IsCompletelyExpired(AuthToken authToken)
    {
        if (authToken == null || 
            string.IsNullOrEmpty(authToken.AccessToken) || 
            string.IsNullOrEmpty(authToken.RefreshToken))
            return true;
            
        // 액세스 토큰과 리프레시 토큰 모두 만료된 경우
        return IsAccessTokenExpired(authToken) && IsRefreshTokenExpired(authToken);
    }
    
    /// <summary>
    /// JWT 토큰으로부터 유효기간 계산
    /// </summary>
    /// <param name="token">JWT 토큰</param>
    /// <returns>남은 유효기간(초) 또는 0</returns>
    public long GetRemainingValidity(string token)
    {
        var expiration = GetTokenExpirationTime(token);
        if (expiration == null)
            return 0;
            
        var timeSpan = expiration.Value - DateTime.UtcNow;
        return timeSpan.TotalSeconds > 0 ? (long)timeSpan.TotalSeconds : 0;
    }
    
    /// <summary>
    /// AuthToken 객체의 액세스 토큰 유효기간 계산
    /// </summary>
    /// <param name="authToken">AuthToken 객체</param>
    /// <returns>남은 유효기간(초) 또는 0</returns>
    public long GetAccessTokenRemainingValidity(AuthToken authToken)
    {
        if (authToken == null || string.IsNullOrEmpty(authToken.AccessToken))
            return 0;
            
        var nowSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var remainingSeconds = authToken.AccessTokenExpiresIn - nowSeconds;
        
        return remainingSeconds > 0 ? remainingSeconds : 0;
    }
    
    /// <summary>
    /// AuthToken 객체의 리프레시 토큰 유효기간 계산
    /// </summary>
    /// <param name="authToken">AuthToken 객체</param>
    /// <returns>남은 유효기간(초) 또는 0</returns>
    public long GetRefreshTokenRemainingValidity(AuthToken authToken)
    {
        if (authToken == null || string.IsNullOrEmpty(authToken.RefreshToken))
            return 0;
            
        var nowSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var remainingSeconds = authToken.RefreshTokenExpiresIn - nowSeconds;
        
        return remainingSeconds > 0 ? remainingSeconds : 0;
    }
}