using IV.Shared.Model;

namespace IV.Shared.Interfaces.Data;

public interface IAlbumSubscriptionContext
{
    /// <summary>
    /// 사용자의 앨범 구독 정보를 가져옵니다.
    /// </summary>
    /// <param name="userId">사용자 ID</param>
    /// <returns>사용자가 구독한 앨범 목록</returns>
    Task<List<AlbumSubscriptionModel>> GetSubscriptionsByUserIdAsync(int userId);

    /// <summary>
    /// 특정 앨범을 사용자가 구독하도록 설정합니다.
    /// </summary>
    /// <param name="userId">사용자 ID</param>
    /// <param name="albumId">앨범 ID</param>
    /// <returns>구독 성공 여부</returns>
    Task<bool> SubscribeToAlbumAsync(int userId, int albumId);

    /// <summary>
    /// 특정 앨범에 대한 사용자의 구독을 취소합니다.
    /// </summary>
    /// <param name="userId">사용자 ID</param>
    /// <param name="albumId">앨범 ID</param>
    /// <returns>구독 취소 성공 여부</returns>
    Task<bool> UnsubscribeFromAlbumAsync(int userId, int albumId);

    /// <summary>
    /// 사용자의 특정 앨범 구독 상태를 확인합니다.
    /// </summary>
    /// <param name="userId">사용자 ID</param>
    /// <param name="albumId">앨범 ID</param>
    /// <returns>구독 여부</returns>
    Task<bool> IsSubscribedToAlbumAsync(int userId, int albumId);
}