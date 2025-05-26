using MESALL.Shared.Interfaces;
using MESALL.Shared.Response;
using Microsoft.AspNetCore.Components.Authorization;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using MESALL.Shared.Models;

namespace MESALL.Web.Services;

public class OrganizationService(
    HttpClient httpClient,
    AuthenticationStateProvider authStateProvider,
    string apiUrl = "http://localhost:8080/api/v1"
) : IOrganizationService
{
    private readonly string _organizationsEndpoint = $"{apiUrl}/organizations";

    // 인증 토큰을 헤더에 추가하는 메서드
    private async Task AddAuthorizationHeader()
    {
        // 기존 Authorization 헤더 제거
        httpClient.DefaultRequestHeaders.Authorization = null;

        // CustomAuthenticationStateProvider에서 토큰 가져오기
        var customProvider = authStateProvider as CustomAuthenticationStateProvider;
        if (customProvider != null)
        {
            var token = await customProvider.GetCachedTokenAsync();
            if (token != null && !string.IsNullOrEmpty(token.AccessToken))
            {
                httpClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token.AccessToken);
            }
        }
    }

    public async Task<List<Organization>> GetAllOrganizationsAsync()
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetFromJsonAsync<ApiResponse<List<Organization>>>(_organizationsEndpoint);
            return response?.Success == true ? response.Data : new List<Organization>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetAllOrganizations error: {ex.Message}");
            return new List<Organization>();
        }
    }

    public async Task<Organization> GetOrganizationByIdAsync(int organizationId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetFromJsonAsync<ApiResponse<Organization>>($"{_organizationsEndpoint}/{organizationId}");
            return response?.Success == true ? response.Data : null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetOrganizationById error: {ex.Message}");
            return null;
        }
    }

    public async Task<List<Organization>> GetOrganizationsByCompanyIdAsync(int companyId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetFromJsonAsync<ApiResponse<List<Organization>>>($"{_organizationsEndpoint}/company/{companyId}");
            return response?.Success == true ? response.Data : new List<Organization>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetOrganizationsByCompanyId error: {ex.Message}");
            return new List<Organization>();
        }
    }

    public async Task<List<Organization>> GetOrganizationsByUserIdAsync(int userId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetFromJsonAsync<ApiResponse<List<Organization>>>($"{_organizationsEndpoint}/user/{userId}");
            return response?.Success == true ? response.Data : new List<Organization>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetOrganizationsByUserId error: {ex.Message}");
            return new List<Organization>();
        }
    }

    public async Task<Organization> CreateOrganizationAsync(CreateOrganizationRequest request)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.PostAsJsonAsync(_organizationsEndpoint, request);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<ApiResponse<Organization>>();
                if (result?.Success == true) 
                {
                    Console.WriteLine($"조직 생성 성공: {result.Message}");
                    return result.Data;
                }
                else
                {
                    Console.WriteLine($"조직 생성 실패: {result?.Message}");
                    return null;
                }
            }
            else 
            {
                Console.WriteLine($"조직 생성 실패: HTTP 상태 코드 {response.StatusCode}");
                // 응답 오류 내용 로깅
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"오류 응답: {errorContent}");
                return null;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"CreateOrganization error: {ex.Message}");
            return null;
        }
    }

    public async Task<Organization> UpdateOrganizationAsync(int organizationId, UpdateOrganizationRequest request)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.PutAsJsonAsync($"{_organizationsEndpoint}/{organizationId}", request);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<ApiResponse<Organization>>();
                return result?.Success == true ? result.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"UpdateOrganization error: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteOrganizationAsync(int organizationId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.DeleteAsync($"{_organizationsEndpoint}/{organizationId}");
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<ApiResponse<bool>>();
                return result?.Success == true && result.Data;
            }
            
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DeleteOrganization error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> AddUserToOrganizationAsync(int organizationId, int userId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.PostAsync($"{_organizationsEndpoint}/{organizationId}/users/{userId}", null);
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<ApiResponse<bool>>();
                return result?.Success == true && result.Data;
            }
            
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"AddUserToOrganization error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> RemoveUserFromOrganizationAsync(int organizationId, int userId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.DeleteAsync($"{_organizationsEndpoint}/{organizationId}/users/{userId}");
            
            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadFromJsonAsync<ApiResponse<bool>>();
                return result?.Success == true && result.Data;
            }
            
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"RemoveUserFromOrganization error: {ex.Message}");
            return false;
        }
    }

    public async Task<List<Organization>> GetRootOrganizationsAsync()
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetFromJsonAsync<ApiResponse<List<Organization>>>($"{_organizationsEndpoint}/root");
            return response?.Success == true ? response.Data : new List<Organization>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetRootOrganizations error: {ex.Message}");
            return new List<Organization>();
        }
    }

    public async Task<List<Organization>> GetChildOrganizationsAsync(int parentOrganizationId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetFromJsonAsync<ApiResponse<List<Organization>>>($"{_organizationsEndpoint}/parent/{parentOrganizationId}");
            return response?.Success == true ? response.Data : new List<Organization>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetChildOrganizations error: {ex.Message}");
            return new List<Organization>();
        }
    }

    public async Task<List<Organization>> BuildOrganizationTreeAsync(List<Organization> organizations)
    {
        try
        {
            // 부모-자식 관계 설정
            foreach (var org in organizations)
            {
                org.Children.Clear();
            }
            
            foreach (var org in organizations.Where(o => o.ParentOrganizationId.HasValue))
            {
                var parent = organizations.FirstOrDefault(o => o.OrganizationId == org.ParentOrganizationId);
                if (parent != null)
                {
                    parent.Children.Add(org);
                }
            }
            
            // 루트 조직들만 반환
            return organizations.Where(o => o.IsRoot).ToList();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"BuildOrganizationTree error: {ex.Message}");
            return new List<Organization>();
        }
    }
}