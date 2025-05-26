
using MESALL.Shared.Interfaces;
using MESALL.Shared.Models;
using MESALL.Shared.Response;
using MESALL.Shared.Enums;
using Microsoft.AspNetCore.Components.Authorization;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MESALL.Web.Services;

public class BomService(
    HttpClient httpClient, 
    AuthenticationStateProvider authStateProvider,
    string apiUrl = "http://localhost:8080/api/v1") 
    : IBomService
{
    private readonly string _bomsEndpoint = $"{apiUrl}/boms";
    
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        Converters =
        {
            new BomStatusConverter(),
            new ItemTypeConverter()
        }
    };
    
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
    
    public async Task<List<Bom>> GetAllBomsAsync()
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync(_bomsEndpoint);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<Bom>>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : new List<Bom>();
            }
            
            return new List<Bom>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetAllBoms error: {ex.Message}");
            return new List<Bom>();
        }
    }

    public async Task<Bom?> GetBomByIdAsync(int bomId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync($"{_bomsEndpoint}/{bomId}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<Bom>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetBomById error: {ex.Message}");
            return null;
        }
    }

    public async Task<List<Bom>> GetBomsByStatusAsync(string status)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync($"{_bomsEndpoint}/status/{Uri.EscapeDataString(status)}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<Bom>>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : new List<Bom>();
            }
            
            return new List<Bom>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetBomsByStatus error: {ex.Message}");
            return new List<Bom>();
        }
    }

    public async Task<List<ItemBom>> GetBomItemsAsync(int bomId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync($"{_bomsEndpoint}/{bomId}/items");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<ItemBom>>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : new List<ItemBom>();
            }
            
            return new List<ItemBom>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetBomItems error: {ex.Message}");
            return new List<ItemBom>();
        }
    }

    public async Task<List<ItemBomTree>> GetBomItemTreeAsync(int bomId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync($"{_bomsEndpoint}/{bomId}/tree");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<ItemBomTree>>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : new List<ItemBomTree>();
            }
            
            return new List<ItemBomTree>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetBomItemTree error: {ex.Message}");
            return new List<ItemBomTree>();
        }
    }

    public async Task<Bom?> CreateBomAsync(CreateBomRequest request)
    {
        try
        {
            await AddAuthorizationHeader();
            var jsonContent = JsonSerializer.Serialize(request, _jsonOptions);
            var stringContent = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");
        
            var response = await httpClient.PostAsync(_bomsEndpoint, stringContent);
        
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ApiResponse<Bom>>(responseContent, _jsonOptions);
                if (result?.Success == true)
                {
                    Console.WriteLine($"BOM 생성 성공: {result.Message}");
                    return result.Data;
                }
                else
                {
                    Console.WriteLine($"BOM 생성 실패: {result?.Message}");
                    return null;
                }
            }
            else
            {
                Console.WriteLine($"BOM 생성 실패: HTTP 상태 코드 {response.StatusCode}");
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"오류 응답: {errorContent}");
                return null;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"CreateBom error: {ex.Message}");
            return null;
        }
    }

    public async Task<Bom?> UpdateBomAsync(int bomId, UpdateBomRequest request)
    {
        try
        {
            await AddAuthorizationHeader();
            var content = JsonSerializer.Serialize(request, _jsonOptions);
            var stringContent = new StringContent(content, System.Text.Encoding.UTF8, "application/json");
            
            var response = await httpClient.PutAsync($"{_bomsEndpoint}/{bomId}", stringContent);
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ApiResponse<Bom>>(responseContent, _jsonOptions);
                return result?.Success == true ? result.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"UpdateBom error: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteBomAsync(int bomId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.DeleteAsync($"{_bomsEndpoint}/{bomId}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ApiResponse<bool>>(content, _jsonOptions);
                return result?.Success == true && result.Data;
            }
            
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DeleteBom error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> AddItemToBomAsync(int bomId, AddItemToBomRequest request)
    {
        try
        {
            await AddAuthorizationHeader();
            var content = JsonSerializer.Serialize(request, _jsonOptions);
            var stringContent = new StringContent(content, System.Text.Encoding.UTF8, "application/json");
            
            var response = await httpClient.PostAsync($"{_bomsEndpoint}/{bomId}/items", stringContent);
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ApiResponse<bool>>(responseContent, _jsonOptions);
                return result?.Success == true && result.Data;
            }
            
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"AddItemToBom error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> UpdateBomItemAsync(int bomId, int itemId, UpdateBomItemRequest request)
    {
        try
        {
            await AddAuthorizationHeader();
            var content = JsonSerializer.Serialize(request, _jsonOptions);
            var stringContent = new StringContent(content, System.Text.Encoding.UTF8, "application/json");
            
            var response = await httpClient.PutAsync($"{_bomsEndpoint}/{bomId}/items/{itemId}", stringContent);
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ApiResponse<bool>>(responseContent, _jsonOptions);
                return result?.Success == true && result.Data;
            }
            
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"UpdateBomItem error: {ex.Message}");
            return false;
        }
    }

    public async Task<bool> RemoveItemFromBomAsync(int bomId, int itemId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.DeleteAsync($"{_bomsEndpoint}/{bomId}/items/{itemId}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ApiResponse<bool>>(content, _jsonOptions);
                return result?.Success == true && result.Data;
            }
            
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"RemoveItemFromBom error: {ex.Message}");
            return false;
        }
    }
}

// BomStatus 열거형 문자열 변환을 위한 커스텀 JSON 컨버터
public class BomStatusConverter : JsonConverter<BomStatus>
{
    public override BomStatus Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            string statusStr = reader.GetString() ?? string.Empty;
            
            // 한글 BOM 상태 문자열을 BomStatus 열거형으로 매핑
            return statusStr switch
            {
                "Active" => BomStatus.Active,
                "Inactive" => BomStatus.Inactive,
                "Draft" => BomStatus.Draft,
                _ => TryParseEnum(statusStr)  // 직접 열거형 변환 시도
            };
        }
        
        // 문자열이 아닌 경우(숫자 등) 기본값 반환
        return BomStatus.Draft;
    }

    private BomStatus TryParseEnum(string statusStr)
    {
        // 문자열을 직접 열거형으로 변환 시도 (영문 열거형 이름과 일치하는 경우)
        if (Enum.TryParse<BomStatus>(statusStr, true, out var result))
        {
            return result;
        }
        
        // 변환 실패 시 기본값 반환
        return BomStatus.Draft;
    }

    public override void Write(Utf8JsonWriter writer, BomStatus value, JsonSerializerOptions options)
    {
        // 열거형 값에 따라 서버에 보낼 문자열 결정
        string statusStr = value switch
        {
            BomStatus.Active => "Active",
            BomStatus.Inactive => "Inactive",
            BomStatus.Draft => "Draft",
            _ => value.ToString()
        };
        
        writer.WriteStringValue(statusStr);
    }
}