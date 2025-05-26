using MESALL.Shared.Interfaces;
using MESALL.Shared.Response;
using Microsoft.AspNetCore.Components.Authorization;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using MESALL.Shared.Enums;
using MESALL.Shared.Models;

namespace MESALL.Web.Services;

public class CorrespondentService(
    HttpClient httpClient,
    AuthenticationStateProvider authStateProvider,
    string apiUrl = "http://localhost:8080/api/v1"
) : ICorrespondentService
{
    private readonly string _correspondentsEndpoint = $"{apiUrl}/correspondents";

    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new CorrespondentTypeConverter() }
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

    public async Task<List<Correspondent>> GetAllCorrespondentsAsync()
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync(_correspondentsEndpoint);
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<Correspondent>>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : new List<Correspondent>();
            }
            
            return new List<Correspondent>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetAllCorrespondents error: {ex.Message}");
            return new List<Correspondent>();
        }
    }

    public async Task<Correspondent?> GetCorrespondentByIdAsync(int correspondentId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync($"{_correspondentsEndpoint}/{correspondentId}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<Correspondent>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetCorrespondentById error: {ex.Message}");
            return null;
        }
    }

    public async Task<List<Correspondent>> GetCorrespondentsByTypeAsync(string? type)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.GetAsync($"{_correspondentsEndpoint}/type?type={Uri.EscapeDataString(type.ToString())}");
            
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var apiResponse = JsonSerializer.Deserialize<ApiResponse<List<Correspondent>>>(content, _jsonOptions);
                return apiResponse?.Success == true ? apiResponse.Data : new List<Correspondent>();
            }
            
            return new List<Correspondent>();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"GetCorrespondentsByType error: {ex.Message}");
            return new List<Correspondent>();
        }
    }

    public async Task<Correspondent?> CreateCorrespondentAsync(CreateCorrespondentRequest request)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.PostAsJsonAsync(_correspondentsEndpoint, request);
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ApiResponse<Correspondent>>(responseContent, _jsonOptions);
                if (result?.Success == true) 
                {
                    Console.WriteLine($"거래처 생성 성공: {result.Message}");
                    return result.Data;
                }
                else
                {
                    Console.WriteLine($"거래처 생성 실패: {result?.Message}");
                    return null;
                }
            }
            else 
            {
                Console.WriteLine($"거래처 생성 실패: HTTP 상태 코드 {response.StatusCode}");
                // 응답 오류 내용 로깅
                var errorContent = await response.Content.ReadAsStringAsync();
                Console.WriteLine($"오류 응답: {errorContent}");
                return null;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"CreateCorrespondent error: {ex.Message}");
            return null;
        }
    }

    public async Task<Correspondent?> UpdateCorrespondentAsync(int correspondentId, UpdateCorrespondentRequest request)
    {
        try
        {
            await AddAuthorizationHeader();
            var content = JsonSerializer.Serialize(request, _jsonOptions);
            var stringContent = new StringContent(content, System.Text.Encoding.UTF8, "application/json");
            
            var response = await httpClient.PutAsync($"{_correspondentsEndpoint}/{correspondentId}", stringContent);
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<ApiResponse<Correspondent>>(responseContent, _jsonOptions);
                return result?.Success == true ? result.Data : null;
            }
            
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"UpdateCorrespondent error: {ex.Message}");
            return null;
        }
    }

    public async Task<bool> DeleteCorrespondentAsync(int correspondentId)
    {
        try
        {
            await AddAuthorizationHeader();
            var response = await httpClient.DeleteAsync($"{_correspondentsEndpoint}/{correspondentId}");
            
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
            Console.WriteLine($"DeleteCorrespondent error: {ex.Message}");
            return false;
        }
    }
}

// CorrespondentType 열거형 문자열 변환을 위한 커스텀 JSON 컨버터
public class CorrespondentTypeConverter : JsonConverter<CorrespondentType>
{
    public override CorrespondentType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            string typeStr = reader.GetString() ?? string.Empty;
            
            // 한글 거래처 타입 문자열을 CorrespondentType 열거형으로 매핑
            return typeStr switch
            {
                "매출" => CorrespondentType.Sales,
                "매입" => CorrespondentType.Purchase,
                "매출/매입" => CorrespondentType.Both,
                _ => TryParseEnum(typeStr)  // 직접 열거형 변환 시도
            };
        }
        
        // 문자열이 아닌 경우(숫자 등) 기본값 반환
        return CorrespondentType.Purchase;
    }

    private CorrespondentType TryParseEnum(string typeStr)
    {
        // 문자열을 직접 열거형으로 변환 시도 (영문 열거형 이름과 일치하는 경우)
        if (Enum.TryParse<CorrespondentType>(typeStr, true, out var result))
        {
            return result;
        }
        
        // 변환 실패 시 기본값 반환
        return CorrespondentType.Purchase;
    }

    public override void Write(Utf8JsonWriter writer, CorrespondentType value, JsonSerializerOptions options)
    {
        // 열거형 값에 따라 서버에 보낼 문자열 결정
        string typeStr = value switch
        {
            CorrespondentType.Sales => "매출",
            CorrespondentType.Purchase => "매입",
            CorrespondentType.Both => "매출/매입",
            _ => value.ToString()
        };
        
        writer.WriteStringValue(typeStr);
    }
}