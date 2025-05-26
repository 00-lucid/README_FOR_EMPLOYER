
using MESALL.Shared.Interfaces;
using MESALL.Shared.Models;
using MESALL.Shared.Response;
using MESALL.Shared.Enums;
using Microsoft.AspNetCore.Components.Authorization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace MESALL.Web.Services;

public class ItemService(
    HttpClient httpClient,
    AuthenticationStateProvider authStateProvider,
    string apiUrl = "http://localhost:8080/api/v1")
    : IItemService
{
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new ItemTypeConverter() }
    };

    // ItemType 열거형 변환을 위한 JSON 옵션 설정

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
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token.AccessToken);
            }
        }
    }

    // 모든 품목 조회
    public async Task<List<Item>?> GetAllItemsAsync()
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync($"{apiUrl}/items");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<Item>>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetAllItems error: {ex.Message}");
            return null;
        }
    }

    // 품목 상세 조회
    public async Task<Item?> GetItemByIdAsync(int itemId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync($"{apiUrl}/items/{itemId}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<Item>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetItemById error: {ex.Message}");
            return null;
        }
    }

    // 회사별 품목 조회
    public async Task<List<Item>?> GetItemsByCompanyIdAsync(int companyId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync($"{apiUrl}/items/company/{companyId}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<Item>>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetItemsByCompanyId error: {ex.Message}");
            return null;
        }
    }

    // 품목 타입별 조회
    public async Task<List<Item>?> GetItemsByTypeAsync(string itemType)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync($"{apiUrl}/items/type?itemType={Uri.EscapeDataString(itemType)}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<Item>>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetItemsByType error: {ex.Message}");
            return null;
        }
    }

    // 품목 생성
    public async Task<Item?> CreateItemAsync(CreateItemRequest request)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.PostAsJsonAsync($"{apiUrl}/items", request);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<Item>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"CreateItem error: {ex.Message}");
            return null;
        }
    }

    // 품목 수정
    public async Task<Item?> UpdateItemAsync(int itemId, UpdateItemRequest request)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.PutAsJsonAsync($"{apiUrl}/items/{itemId}", request);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<Item>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"UpdateItem error: {ex.Message}");
            return null;
        }
    }

    // 품목 삭제
    public async Task<bool> DeleteItemAsync(int itemId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.DeleteAsync($"{apiUrl}/items/{itemId}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<bool>>(content, _jsonOptions);
                return apiResponse?.Success == true && apiResponse.Data;
            }
            
            return false;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"DeleteItem error: {ex.Message}");
            return false;
        }
    }
}

// ItemType 열거형 문자열 변환을 위한 커스텀 JSON 컨버터
public class ItemTypeConverter : JsonConverter<ItemType>
{
    public override ItemType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            string typeStr = reader.GetString() ?? string.Empty;
            
            // 한글 제품 타입 문자열을 ItemType 열거형으로 매핑
            return typeStr switch
            {
                "제품" => ItemType.Product,
                "반제품" => ItemType.Semi,
                "원자재" => ItemType.Row,
                "부자재" => ItemType.Sub,
                _ => TryParseEnum(typeStr)  // 직접 열거형 변환 시도
            };
        }
        
        // 문자열이 아닌 경우(숫자 등) 기본값 반환
        return ItemType.Product;
    }

    private ItemType TryParseEnum(string typeStr)
    {
        // 문자열을 직접 열거형으로 변환 시도 (영문 열거형 이름과 일치하는 경우)
        if (Enum.TryParse<ItemType>(typeStr, true, out var result))
        {
            return result;
        }
        
        // 변환 실패 시 기본값 반환
        return ItemType.Product;
    }

    public override void Write(Utf8JsonWriter writer, ItemType value, JsonSerializerOptions options)
    {
        // 열거형을 문자열로 변환해서 작성
        writer.WriteStringValue(value.ToString());
    }
}