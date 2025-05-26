using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.Data.SqlClient;
using SchemaLens.Client.Model;

namespace SchemaLens
{
    public class CustomAuthenticationStateProvider(
        ProtectedLocalStorage protectedLocalStorage
        ) : AuthenticationStateProvider
    {
        private ClaimsPrincipal _currentUser = new ClaimsPrincipal(new ClaimsIdentity()); // 기본값: 익명 사용자

        public override async Task<AuthenticationState> GetAuthenticationStateAsync()
        {
            ClaimsPrincipal principal = new ClaimsPrincipal(new ClaimsIdentity());
            
            var storedPrincipal = await protectedLocalStorage.GetAsync<string>("identity");
            if (storedPrincipal.Success)
            {
                UserModel user = JsonSerializer.Deserialize<UserModel>(storedPrincipal.Value);
                
                ClaimsIdentity identity = CreateIdentityFromUser(user);
                principal = new (identity);
            }
            _currentUser = principal;
            return new AuthenticationState(_currentUser);
        }

        public async void MarkUserAsAuthenticated(UserModel user)
        {
            ClaimsPrincipal principal = new ClaimsPrincipal(new ClaimsIdentity());
            ClaimsIdentity identity = CreateIdentityFromUser(user);
            principal = new ClaimsPrincipal(identity);
            await protectedLocalStorage.SetAsync("identity", JsonSerializer.Serialize(user));
            _currentUser = principal;

            // 인증 상태 변경 알림
            NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
        }

        //public void MarkUserAsAuthenticated(string userName, IEnumerable<Claim> additionalClaims)
        //{
        //    // 인증된 사용자의 ClaimsPrincipal 생성 (추가 클레임 포함)
        //    var claims = new List<Claim> { new Claim(ClaimTypes.Name, userName) };
        //    claims.AddRange(additionalClaims);

        //    var identity = new ClaimsIdentity(claims, "Custom authentication");
        //    _currentUser = new ClaimsPrincipal(identity);

        //    // 인증 상태 변경 알림
        //    NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
        //}

        public async void MarkUserAsLoggedOut()
        {
            await protectedLocalStorage.DeleteAsync("identity");
            NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
        }
        
        private static ClaimsIdentity CreateIdentityFromUser(UserModel user)
        {
            return new ClaimsIdentity(new Claim[]
            {
                new (ClaimTypes.Sid, user.UserId.ToString()),
                new (ClaimTypes.Name, user.Username),
                new (ClaimTypes.Email, user.Email),
                new (ClaimTypes.DateOfBirth, user.CreatedAt.ToLongDateString()),
                new (ClaimTypes.Authentication, user.LastLoginAt.ToLongDateString()),
                new (ClaimTypes.Role, user.Authority),
                new (ClaimTypes.UserData, user.Name),
            }, "SchemaLens");
        }
    }

}
