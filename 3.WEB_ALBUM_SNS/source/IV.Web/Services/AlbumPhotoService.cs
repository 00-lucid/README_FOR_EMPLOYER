using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using IV.Shared.Interfaces;
using IV.Shared.Interfaces.Services;

namespace IV.Web.Services;

public class AlbumPhotoService(
    IAlbumPhotoContext albumPhotoContext
    ): IAlbumPhotoService
{
    public Task<List<AlbumPhotoModel>> GetAlbumPhotoByIdAsync(int albumId)
    {
        return albumPhotoContext.GetAlbumPhotoByIdAsync(albumId);
    }

    public Task<bool> UploadPhotoAsyncByAlbumId(int albumId, Stream fileStream, string fileName)
    {
        return albumPhotoContext.UploadPhotoAsync(albumId, fileStream, fileName);
    }

    public Task<bool> DeletePhotoAsyncByPhotoId(int albumId, int photoId)
    {
        return albumPhotoContext.DeletePhotoAsyncByPhotoId(albumId, photoId);
    }
    
    public Task<bool> UploadChunkAsyncByAlbumId(int albumId, byte[] chunkData, int chunkIndex, string fileId)
    {
        // Context로 위임
        return albumPhotoContext.UploadChunkAsyncByAlbumId(albumId, chunkData, chunkIndex, fileId);
    }

    public Task<bool> FinishChunkUploadAsyncByAlbumId(int albumId, string fileId, string originalFileName)
    {
        // Context로 위임
        return albumPhotoContext.FinishChunkUploadAsyncByAlbumId(albumId, fileId, originalFileName);
    }

    public Task<bool> AddFileInfo(int albumId, string fileUri)
    {
        return albumPhotoContext.AddFileInfo(albumId, fileUri);
    }
}