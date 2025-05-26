using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using IV.Web.Data;
using Microsoft.AspNetCore.Components.Authorization;

namespace IV.Web.Services;

public class LoginService(
    ILoginContext loginContext,
    AuthenticationStateProvider authenticationStateProvider
    ): ILoginService
{
    public async Task<UserModel?> LoginAsync(string email, string password)
    {
        // LoginContext에서 UserModel 반환
        UserModel? userModel = await loginContext.LoginAsync(email, password);

        if (userModel != null)
        {
            // 로그인 성공 시 인증 처리
            ((CustomAuthenticationStateProvider)authenticationStateProvider).MarkUserAsAuthenticated(userModel);
            return userModel; // 성공 시 UserModel 반환
        }
        else
        {
            // 로그인 실패 시 null 반환
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
        // LoginContext의 SignupAsync 호출
        bool isSignupSuccessful = await loginContext.SignupAsync(username, email, password);

        if (isSignupSuccessful)
        {
            // 성공 처리
            Console.WriteLine("Signup successful.");
            return true;
        }
        else
        {
            // 실패 처리
            Console.WriteLine("Signup failed due to email duplication or database error.");
            return false;
        }
    }
}