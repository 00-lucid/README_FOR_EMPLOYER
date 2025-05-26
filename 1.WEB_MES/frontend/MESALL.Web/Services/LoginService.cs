using MESALL.Shared.Interfaces;
using MESALL.Shared.Models;
using MESALL.Shared.Response;
using Microsoft.AspNetCore.Components.Authorization;

namespace MESALL.Web.Services;

public class LoginService(
    AuthenticationStateProvider authenticationStateProvider,
    HttpClient httpClient,
    string apiUrl = "http://localhost:8080/api/v1"
    ): ILoginService
{
    public async Task<AuthToken?> LoginAsync(string email, string password)
    {
        try
        {
            // API 요청을 위한 로그인 데이터 준비
            var loginRequest = new
            {
                loginId = email,
                password = password
            };

            // API 호출
            var response = await httpClient.PostAsJsonAsync($"{apiUrl}/user/login", loginRequest);
            
            if (response.IsSuccessStatusCode)
            {
                // 응답 처리
                var loginResponse = await response.Content.ReadFromJsonAsync<ApiResponse<AuthToken>>();
                
                if (loginResponse?.Success == true)
                {
                    AuthToken? token = loginResponse.Data;
                    // 로그인 성공 시 인증 처리
                    ((CustomAuthenticationStateProvider)authenticationStateProvider).MarkUserAsAuthenticated(token);
                    return token;
                }
            }
            
            // 로그인 실패
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Login error: {ex.Message}");
            return null;
        }
    }

    public Task LogoutAsync()
    {
        ((CustomAuthenticationStateProvider)authenticationStateProvider).MarkUserAsLoggedOut();
        return Task.CompletedTask;
    }

    public async Task<bool> SignupAsync(string username, string email, string password)
    {
        try
        {
            // API 요청을 위한 로그인 데이터 준비
            var signupRequest = new
            {
                companyId = 2,
                username = username,
                email = email,
                password = password
            };
            
            // API 호출
            var response = await httpClient.PostAsJsonAsync($"{apiUrl}/user/signup", signupRequest);
            
            if (response.IsSuccessStatusCode)
            {
                // 응답 처리
                var loginResponse = await response.Content.ReadFromJsonAsync<ApiResponse<AuthToken>>();
                
                if (loginResponse?.Success == true)
                {
                    AuthToken? token = loginResponse.Data;
                    // 로그인 성공 시 인증 처리
                    ((CustomAuthenticationStateProvider)authenticationStateProvider).MarkUserAsAuthenticated(token);
                    return true;
                }
            }
            
            // 로그인 실패
            return false;
        } 
        catch (Exception ex)
        {
            Console.WriteLine($"Login error: {ex.Message}");
            return false;
        }
    }
}