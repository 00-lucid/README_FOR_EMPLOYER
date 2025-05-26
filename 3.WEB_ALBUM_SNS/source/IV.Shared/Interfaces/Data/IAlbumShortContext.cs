using IV.Shared.Model;

namespace IV.Shared.Interfaces.Data;

public interface IAlbumShortContext
{
    Task<bool> AddFileInfo(int albumId, string fileUri);
    
    /// <summary>
    /// 특정 앨범 쇼츠 정보를 가져옵니다.
    /// </summary>
    /// <param name="albumId">앨범 ID</param>
    /// <returns>앨범 쇼츠 정보</returns>
    Task<List<AlbumShortModel>> GetAlbumShortsByIdAsync(int albumId);
    
    Task<bool> DeleteShortAsyncByShortId(int albumId, int shortId);
    
    public Task<bool> RegisterThumbnailAsync(string videoUrl, string thumbnailUrl, int albumId);
}