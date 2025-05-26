
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using MESALL.Shared.Models;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.Extensions.Caching.Distributed;

namespace MESALL.Web;

public class CustomAuthenticationStateProvider(IDistributedCache distributedCache) : AuthenticationStateProvider
{
    private ClaimsPrincipal _currentToken = new ClaimsPrincipal(new ClaimsIdentity()); // 기본값: 익명 사용자

    private const string CACHE_KEY = "user_identity_{0}"; // 사용자별 키
    private AuthToken? _cachedToken;

    // 캐시된 토큰을 가져오는 새 메서드 (외부에서 사용 가능)
    public async Task<AuthToken?> GetCachedTokenAsync()
    {
        if (_cachedToken != null)
        {
            return _cachedToken;
        }

        try
        {
            string userKey = string.Format(CACHE_KEY, "current_session");
            string? cachedUserJson = await distributedCache.GetStringAsync(userKey);
            
            if (!string.IsNullOrEmpty(cachedUserJson))
            {
                var token = JsonSerializer.Deserialize<AuthToken>(cachedUserJson);
                _cachedToken = token;
                return token;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetCachedToken error: {ex.Message}");
        }

        return null;
    }
    
    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        ClaimsPrincipal principal = new ClaimsPrincipal(new ClaimsIdentity());

        try
        {
            // 이미 메모리에 있는 사용자 정보 확인
            if (_cachedToken != null)
            {
                ClaimsIdentity identity = CreateIdentityFromUser(_cachedToken);
                principal = new ClaimsPrincipal(identity);
            }
            else
            {
                // 세션 ID나 사용자 ID를 알 수 있는 방법이 필요함
                // 예시로 "current_session"이라는 고정 키를 사용
                string userKey = string.Format(CACHE_KEY, "current_session");
            
                // 분산 캐시에서 사용자 정보 읽기
                string? cachedUserJson = await distributedCache.GetStringAsync(userKey);
            
                if (!string.IsNullOrEmpty(cachedUserJson))
                {
                    AuthToken? token = JsonSerializer.Deserialize<AuthToken>(cachedUserJson);
                    if (token != null)
                    {
                        _cachedToken = token; // 메모리에 캐싱
                        ClaimsIdentity identity = CreateIdentityFromUser(token);
                        principal = new ClaimsPrincipal(identity);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"AuthState error: {ex.Message}");
            // 오류 발생 시 캐시 정보 초기화
            _cachedToken = null;
        }

        _currentToken = principal;
        return new AuthenticationState(_currentToken);
    }

    public async Task MarkUserAsAuthenticatedAsync(AuthToken token)
    {
        ClaimsIdentity identity = CreateIdentityFromUser(token);
        ClaimsPrincipal principal = new ClaimsPrincipal(identity);

        try
        {
            // 적절한 세션/사용자 식별자로 대체
            string userKey = string.Format(CACHE_KEY, "current_session");
        
            // 분산 캐시에 사용자 정보 저장
            var options = new DistributedCacheEntryOptions()
                .SetSlidingExpiration(TimeSpan.FromMinutes(30))
                .SetAbsoluteExpiration(TimeSpan.FromHours(8));
        
            await distributedCache.SetStringAsync(
                userKey, 
                JsonSerializer.Serialize(token),
                options
            );
        
            // 로컬 캐시 업데이트
            _cachedToken = token;
            _currentToken = principal;

            // 인증 상태 변경 알림
            NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to save user data: {ex.Message}");
        }
    }

    // 이전 메서드와의 호환성을 위한 동기 래퍼
    public void MarkUserAsAuthenticated(AuthToken token)
    {
        _ = MarkUserAsAuthenticatedAsync(token);
    }
    
    public async Task MarkUserAsLoggedOutAsync()
    {
        try
        {
            string userKey = string.Format(CACHE_KEY, "current_session");
            await distributedCache.RemoveAsync(userKey);
        
            // 로컬 캐시 초기화
            _cachedToken = null;
            _currentToken = new ClaimsPrincipal(new ClaimsIdentity());
        
            NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Logout error: {ex.Message}");
        }
    }

    // 이전 메서드와의 호환성을 위한 동기 래퍼
    public void MarkUserAsLoggedOut()
    {
        _ = MarkUserAsLoggedOutAsync();
    }
    
    private static ClaimsIdentity CreateIdentityFromUser(AuthToken token)
    {
        if (token == null || string.IsNullOrEmpty(token.AccessToken))
        {
            return new ClaimsIdentity();
        }

        try
        {
            // JWT 토큰 파싱
            var tokenHandler = new JwtSecurityTokenHandler();
            if (!tokenHandler.CanReadToken(token.AccessToken))
            {
                return new ClaimsIdentity();
            }

            var jwtToken = tokenHandler.ReadJwtToken(token.AccessToken);
            var claims = new List<Claim>();

            // 기본 클레임 추가
            var userId = jwtToken.Claims.FirstOrDefault(x => x.Type == "userId" || x.Type == "sub")?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                claims.Add(new Claim(ClaimTypes.NameIdentifier, userId));
            }

            var username = jwtToken.Claims.FirstOrDefault(x => x.Type == "username")?.Value;
            if (!string.IsNullOrEmpty(username))
            {
                claims.Add(new Claim(ClaimTypes.Name, username));
            }

            var email = jwtToken.Claims.FirstOrDefault(x => x.Type == "email")?.Value;
            if (!string.IsNullOrEmpty(email))
            {
                claims.Add(new Claim(ClaimTypes.Email, email));
            }

            // 추가 클레임 처리
            var companyId = jwtToken.Claims.FirstOrDefault(x => x.Type == "companyId")?.Value;
            if (!string.IsNullOrEmpty(companyId))
            {
                claims.Add(new Claim("CompanyId", companyId));
            }

            // 원본 JWT 클레임을 모두 추가
            foreach (var claim in jwtToken.Claims)
            {
                // 이미 처리된 기본 클레임은 중복 추가하지 않음
                if (claim.Type != "userId" && claim.Type != "sub" && 
                    claim.Type != "username" && claim.Type != "email" && 
                    claim.Type != "companyId")
                {
                    claims.Add(new Claim(claim.Type, claim.Value));
                }
            }

            return new ClaimsIdentity(claims, "MESALL");
        }
        catch
        {
            // 토큰 파싱 실패 시 빈 클레임 아이덴티티 반환
            return new ClaimsIdentity();
        }
    }
}