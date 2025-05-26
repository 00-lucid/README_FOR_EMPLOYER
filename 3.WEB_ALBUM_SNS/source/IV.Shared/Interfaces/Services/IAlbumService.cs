using IV.Shared.Model;

namespace IV.Shared.Interfaces.Services
{
    public interface IAlbumService
    {
        /// <summary>
        /// 특정 사용자의 앨범 정보를 가져옵니다.
        /// </summary>
        /// <param name="userId">사용자 ID</param>
        /// <returns>사용자의 앨범 리스트</returns>
        Task<List<AlbumModel>> GetAlbumByUserIdAsync(int userId);
        
        /// <summary>
        /// 권한이 있는 특정 앨범 ID의 앨범 정보를 가져옵니다.
        /// </summary>
        /// <param name="albumId">앨범 ID</param>
        /// <param name="userId">유저 ID</param>
        /// <returns>앨범 리스트</returns>
        Task<AlbumModel?> GetAlbumById(int albumId, int userId);
        
        /// <summary>
        /// 여러 앨범 정보를 데이터베이스에 삽입하고,
        /// 생성된 AlbumId 목록을 비동기로 반환합니다.
        /// </summary>
        /// <param name="albums">생성할 앨범 모델 리스트</param>
        /// <returns>생성된 앨범의 AlbumId 목록</returns>
        Task<List<int>> CreateAlbumsAsync(List<AlbumModel> albums);
        
        /// <summary>
        /// 특정 앨범 정보를 가져옵니다.
        /// </summary>
        /// <param name="albumId">앨범 ID</param>
        /// <returns>앨범 상세 정보</returns>
        Task<List<AlbumModel>> GetAlbumDetailByIdAsync(int albumId);
        
        /// <summary>
        /// 특정 앨범 썸네일 정보를 가져옵니다.
        /// </summary>
        /// <param name="albumId">앨범 ID</param>
        /// <returns>앨범 썸네일 정보</returns>
        Task<List<AlbumPhotoModel>> GetAlbumThumbnailByIdAsync(int albumId);
        
        /// <summary>
        /// 특정 앨범을 삭제합니다.
        /// </summary>
        /// <param name="albumId">앨범 ID</param>
        /// <returns>삭제 성공 여부</returns>
        Task<bool> DeleteAlbumAsyncById(int albumId);
        
        /// <summary>
        /// 앨범 정보를 업데이트합니다.
        /// </summary>
        /// <param name="album">업데이트할 앨범 정보</param>
        /// <returns>업데이트 성공 여부</returns>
        Task<bool> UpdateAlbumAsync(AlbumModel album);
        
        /// <summary>
        /// 앨범의 구독자 정보를 가져옵니다.
        /// </summary>
        /// <param name="albumId">기준이 될 앨범 ID</param>
        /// <returns>구독자 목록</returns>
        Task<List<UserModel>> GetSubscribersByAlbumId(int albumId);
        
        /// <summary>
        /// 앨범 초대 메일을 발송합니다.
        /// </summary>
        /// <param name="email">수신자 이메일</param>
        /// <param name="albumId">초대할 앨범 ID</param>
        /// <returns>발송된 초대의 토큰</returns>
        Task<string> InviteUserToAlbumAsync(string email, int albumId, int senderId);
        
        /// <summary>
        /// 앨범 초대 메일을 검증합니다.
        /// </summary>
        /// <param name="email">수신자 이메일</param>
        /// <param name="token">초대 토큰</param>
        /// <param name="attachDate">접근 날짜</param>
        /// <param name="senderId">보낸 사람 id</param>
        /// <returns>초대의 유효성 리턴</returns>
        Task<bool> ValidateInvitation(string email, string token, DateTime attachDate, int senderId);
        
        /// <summary>
        /// 앨범 메일 초대 이력을 가져옵니다.
        /// </summary>
        /// <param name="albumId">앨범</param>
        /// <returns>메일 초대 이력</returns>
        Task<List<EmailInvitationModel>> GetInvitationByAlbumId(int albumId);
        
        /// <summary>
        /// 앨범 메일 초대 상태를 업데이트합니다.
        /// </summary>
        /// <param name="email">수신자 이메일</param>
        /// <param name="token">초대 토큰</param>
        /// <param name="attachDate">접근 날짜</param>
        /// <param name="senderId">보낸 사람 id</param>
        /// <param name="invitationStatus">상태</param>
        /// <returns>성공 여부</returns>
        Task<bool> UpdateInvitationStatus(string email, string token, DateTime attachDate, int senderId, string invitationStatus);
    }
}