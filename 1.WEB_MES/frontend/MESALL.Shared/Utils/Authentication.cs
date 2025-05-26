using Microsoft.AspNetCore.Components.Authorization;

namespace MESALL.Shared.utils;

public class Authentication
{
        /// <summary>
        /// 인증 상태에서 회사 ID를 가져옵니다.
        /// </summary>
        /// <param name="authStateProvider">인증 상태 제공자</param>
        /// <param name="defaultCompanyId">기본 회사 ID (인증 정보가 없을 경우 사용)</param>
        /// <returns>회사 ID</returns>
        public static async Task<int> GetCompanyIdFromAuthAsync(
            AuthenticationStateProvider authStateProvider,
            int defaultCompanyId = 1)
        {
            try
            {
                // 인증 상태에서 회사 ID 가져오기
                var authState = await authStateProvider.GetAuthenticationStateAsync();
                var user = authState.User;
                
                if (user.Identity.IsAuthenticated)
                {
                    // 먼저 CompanyId 클레임 확인 (대문자로 시작하는 경우)
                    var companyIdClaim = user.Claims.FirstOrDefault(c => c.Type == "CompanyId");
                    if (companyIdClaim != null && int.TryParse(companyIdClaim.Value, out int companyId))
                    {
                        return companyId;
                    }
                    
                    // companyId 클레임 확인 (소문자로 시작하는 경우)
                    companyIdClaim = user.Claims.FirstOrDefault(c => c.Type == "companyId");
                    if (companyIdClaim != null && int.TryParse(companyIdClaim.Value, out companyId))
                    {
                        return companyId;
                    }
                    
                    // CustomAuthenticationStateProvider에서 직접 토큰 가져오기 시도
                    // var customProvider = authStateProvider as CustomAuthenticationStateProvider;
                    // if (customProvider != null)
                    // {
                    //     var token = await customProvider.GetCachedTokenAsync();
                    //     if (token != null)
                    //     {
                    //         // 토큰에서 추가 정보를 확인할 수 있지만,
                    //         // JWT 토큰의 클레임은 이미 AuthenticationStateProvider에 반영되어 있음
                    //         Console.WriteLine("Token retrieved from CustomAuthenticationStateProvider");
                    //     }
                    // }
                    
                    // 그 밖의 자체 로직 (예: 기본값 사용)
                    Console.WriteLine($"Using default companyId: {defaultCompanyId}");
                }
                else
                {
                    // 인증되지 않은 경우 기본값 사용
                    Console.WriteLine("사용자가 인증되지 않았습니다. 기본 회사 ID를 사용합니다.");
                }
            }
            catch (Exception ex)
            {
                // 오류 발생 시 기본값 사용
                Console.WriteLine($"회사 ID를 가져오는 중 오류가 발생했습니다: {ex.Message}");
            }
            
            return defaultCompanyId;
        }
}