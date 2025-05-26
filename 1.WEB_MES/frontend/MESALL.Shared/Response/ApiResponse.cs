namespace MESALL.Shared.Response;

/// <summary>
/// 표준 API 응답 형식
/// </summary>
/// <typeparam name="T">응답 데이터의 타입</typeparam>
public class ApiResponse<T>(bool success, string message, T? data = default)
{
    public bool Success { get; } = success;
    public string Message { get; } = message;
    public T? Data { get; } = data;
}