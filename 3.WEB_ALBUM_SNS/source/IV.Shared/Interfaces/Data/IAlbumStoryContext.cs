using IV.Shared.Model;

namespace IV.Shared.Interfaces.Data;

public interface IAlbumStoryContext
{
    /// <summary>
    /// 특정 앨범 스토리 정보를 가져옵니다.
    /// </summary>
    /// <param name="albumId">앨범 ID</param>
    /// <returns>앨범 사진 정보</returns>
    Task<List<AlbumStoryModel>> GetAlbumStoryByIdAsync(int albumId);
    
    /// <summary>
    /// 특정 앨범에 스토리를 업로드합니다.
    /// </summary>
    /// <param name="albumId">앨범 ID</param>
    /// <param name="fileStream">업로드할 파일의 스트림</param>
    /// <param name="fileName">업로드할 파일 이름</param>
    /// <returns>업로드 성공 여부</returns>
    Task<bool> UploadStoryAsyncByAlbumId(int albumId, Stream fileStream, string fileName);
    
    /// <summary>
    /// 특정 앨범에서 스토리를 삭제합니다.
    /// </summary>
    /// <param name="albumId">앨범 ID</param>
    /// <param name="photoId">삭제하려는 스토리 ID</param>
    /// <returns>삭제 성공 여부</returns>
    Task<bool> DeleteStoryAsyncByStoryId(int albumId, int storyId);
    Task<bool> UploadChunkAsyncByAlbumId(int albumId, byte[] chunkData, int chunkIndex, string fileId);
    Task<bool> FinishChunkUploadAsyncByAlbumId(int albumId, string fileId, string originalFileName);
    
    Task<bool> AddFileInfo(int albumId, string fileUri);
}