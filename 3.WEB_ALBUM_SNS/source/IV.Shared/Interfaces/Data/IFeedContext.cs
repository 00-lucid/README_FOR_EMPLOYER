using IV.Shared.Model;

namespace IV.Shared.Interfaces.Data;

public interface IFeedContext
{
    /// <summary>
    /// 특정 피드 ID로 피드 정보를 가져옵니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <returns>해당 피드 정보 (없으면 null)</returns>
    Task<FeedModel?> GetFeedByIdAsync(int feedId);

    /// <summary>
    /// 특정 앨범에 속한 피드 목록을 가져옵니다.
    /// </summary>
    /// <param name="albumId">앨범 ID</param>
    /// <returns>해당 앨범의 피드 목록</returns>
    Task<List<FeedModel>> GetFeedsByAlbumIdAsync(int albumId);

    /// <summary>
    /// 새 피드 항목을 생성합니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <param name="creatorUserId">피드 생성자(사용자) ID</param>
    /// <returns>생성된 피드의 FeedId (실패 시 0 또는 예외 발생)</returns>
    Task<int> CreateFeedAsync(int feedId, int creatorUserId, string body);

    /// <summary>
    /// 새 피드 사진을 생성합니다.
    /// </summary>
    /// <param name="albumId">앨범 ID</param>
    /// <param name="photoId">피드 사진</param>
    /// <param name="sortOrder">피드 사진 순서</param>
    /// <returns>생성된 피드의 FeedId (실패 시 0 또는 예외 발생)</returns>
    Task<bool> CreateFeedAlbumPhotoAsync(int albumId, int photoId, int sortOrder);
    
    /// <summary>
    /// 새 피드 쇼츠를 생성합니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <param name="shortId">피드 쇼츠</param>
    /// <param name="sortOrder">피드 쇼츠 순서</param>
    /// <returns>생성된 피드의 FeedId (실패 시 0 또는 예외 발생)</returns>
    Task<bool> CreateFeedAlbumShortAsync(int feedId, int shortId, int sortOrder);
    
    /// <summary>
    /// 피드의 좋아요 수를 업데이트합니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <param name="likeCount">새 좋아요 수</param>
    /// <returns>업데이트 성공 여부</returns>
    Task<bool> UpdateLikeCountAsync(int feedId, int likeCount);

    /// <summary>
    /// 피드의 댓글 수를 업데이트합니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <param name="commentCount">새 댓글 수</param>
    /// <returns>업데이트 성공 여부</returns>
    Task<bool> UpdateCommentCountAsync(int feedId, int commentCount);

    /// <summary>
    /// 피드(Feed) 항목을 삭제합니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <returns>삭제 성공 여부</returns>
    Task<bool> DeleteFeedAsync(int feedId);
    
    /// <summary>
    /// 구독한 앨범의 피드를 가져옵니다.
    /// </summary>
    /// <param name="userId">유저 ID</param>
    /// <returns>삭제 성공 여부</returns>
    Task<List<FeedModel>> GetFeedsBySubscription(int userId);
    
    /// <summary>
    /// 특정 피드에 속한 사진을 전부 가져옵니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <returns>사진 URL 리스트</returns>
    Task<List<string>> GetFeedsAlbumPhotoAsync(int feedId);
    
    /// <summary>
    /// 특정 피드에 속한 쇼츠를 전부 가져옵니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <returns>쇼츠 URL 리스트</returns>
    Task<List<string>> GetFeedsAlbumShortAsync(int feedId);
    
    /// <summary>
    /// 특정 피드에 속한 미디어를 전부 가져옵니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <returns>미디어 리스트</returns>
    Task<List<FeedMedia>> GetFeedMediasAsync(int feedId);
    
    /// <summary>
    /// 피드에 좋아요를 추가하거나 제거합니다.
    /// </summary>
    /// <param name="userId">유저 ID</param>
    /// <param name="feedId">피드 ID</param>
    /// <returns>좋아요 성공 여부</returns>
    Task<bool> ToggleLikeFeedAsync(int userId, int feedId);
    
    /// <summary>
    /// 피드의 좋아요 여부를 가져옵니다.
    /// </summary>
    /// <param name="userId">유저 ID</param>
    /// <param name="feedId">피드 ID</param>
    /// <returns>좋아요 여부</returns>
    Task<bool> GetLikeFeedAsync(int userId, int feedId);
    
    /// <summary>
    /// 피드의 댓글을 가져옵니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <returns>댓글</returns>
    Task<List<FeedCommentModel>> GetFeedCommentsAsync(int feedId);
    
    /// <summary>
    /// 피드의 댓글 수를 가져옵니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <returns>댓글 수</returns>
    Task<int> GetFeedCommentCountAsync(int feedId);
    
    /// <summary>
    /// 피드에 댓글을 등록합니다.
    /// </summary>
    /// <param name="feedId">피드 ID</param>
    /// <param name="content">댓글 내용</param>
    /// <param name="userId">작성자</param>
    /// <returns>등록 성공 여부</returns>
    Task<bool> AddFeedCommentAsync(int feedId, string content, int userId);
}