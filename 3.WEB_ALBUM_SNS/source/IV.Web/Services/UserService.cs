using System.Security.Claims;
using IV.Shared.Interfaces.Data;
using IV.Shared.Interfaces;
using IV.Shared.Interfaces.Services;
using IV.Shared.Model;
using IV.Web.Data;
using Microsoft.AspNetCore.Components.Authorization;
using SchemaLens.Client.Utils;

namespace IV.Web.Services;

public class UserService(
    IUserContext userContext,
    AuthenticationStateProvider authenticationStateProvider
    ): IUserService
{
    private int? _cachedUserId;
    
    public Task<bool> ResetPasswordAsync(string email, string newPassword)
    {
        return userContext.ResetPasswordAsync(email, newPassword);
    }

    public Task<List<UserModel>> SearchUsersAsync(string keyword)
    {
        return userContext.SearchUsersAsync(keyword);
    }

    public Task<UserModel> GetCurrentUserAsync(int userId)
    {
        return userContext.GetCurrentUserAsync(userId);
    }

    public Task<UserModel> UpdateProfileAsync(int userId, string fileUri)
    {
        return userContext.UpdateProfileAsync(userId, fileUri);
    }

    public async Task<int> GetUserIdAsync()
    {
        if (_cachedUserId.HasValue)
        {
            // 이미 가져온 값이 있으면 바로 반환
            return _cachedUserId.Value;
        }

        var authState = ((CustomAuthenticationStateProvider)authenticationStateProvider).GetAuthenticationStateAsync();
        _cachedUserId = Int32.Parse(await Common.GetClaimValueAsync(authState, "sid") ?? "-1");

        return _cachedUserId.Value;
    }

    public Task<UserModel> UpdateBackgroundAsync(int userId, string fileUri)
    {
        return userContext.UpdateBackgroundAsync(userId, fileUri);
    }

    public async Task<string> GetUserNameAsync()
    {
        // 인증 상태 객체를 가져옴
        var authState = ((CustomAuthenticationStateProvider)authenticationStateProvider).GetAuthenticationStateAsync();

        // ClaimTypes.Name에서 사용자 이름 받아옴
        string username = await Common.GetClaimValueAsync(authState, ClaimTypes.Name) ?? string.Empty;

        return username;
    }
    
    /// <summary>
    /// 사용자가 로그인(인증)되어 있는지 확인하는 함수
    /// </summary>
    /// <returns>로그인 상태이면 true, 아니면 false</returns>
    public async Task<bool> IsLoggedInAsync()
    {
        var authStateTask = ((CustomAuthenticationStateProvider)authenticationStateProvider).GetAuthenticationStateAsync();
        var authState = await authStateTask;

        return authState.User?.Identity?.IsAuthenticated ?? false;
    }
}