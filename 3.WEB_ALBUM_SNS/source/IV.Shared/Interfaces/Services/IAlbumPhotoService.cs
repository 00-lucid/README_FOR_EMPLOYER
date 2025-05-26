using IV.Shared.Model;

namespace IV.Shared.Interfaces.Services;

public interface IAlbumPhotoService
{
    /// <summary>
    /// 특정 앨범 사진 정보를 가져옵니다.
    /// </summary>
    /// <param name="albumId">앨범 ID</param>
    /// <returns>앨범 사진 정보</returns>
    Task<List<AlbumPhotoModel>> GetAlbumPhotoByIdAsync(int albumId);
    
    /// <summary>
    /// 특정 앨범에 사진을 업로드합니다.
    /// </summary>
    /// <param name="albumId">앨범 ID</param>
    /// <param name="fileStream">업로드할 파일의 스트림</param>
    /// <param name="fileName">업로드할 파일 이름</param>
    /// <returns>업로드 성공 여부</returns>
    Task<bool> UploadPhotoAsyncByAlbumId(int albumId, Stream fileStream, string fileName);
    
    /// <summary>
    /// 특정 앨범에서 사진을 삭제합니다.
    /// </summary>
    /// <param name="albumId">앨범 ID</param>
    /// <param name="photoId">삭제하려는 사진의 ID</param>
    /// <returns>삭제 성공 여부</returns>
    Task<bool> DeletePhotoAsyncByPhotoId(int albumId, int photoId);

    Task<bool> UploadChunkAsyncByAlbumId(int albumId, byte[] chunkData, int chunkIndex, string fileId);
    Task<bool> FinishChunkUploadAsyncByAlbumId(int albumId, string fileId, string originalFileName);

    Task<bool> AddFileInfo(int albumId, string fileUri);
}