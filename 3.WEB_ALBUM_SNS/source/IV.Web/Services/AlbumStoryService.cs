using IV.Shared.Interfaces.Data;
using IV.Shared.Interfaces.Services;
using IV.Shared.Model;

namespace IV.Web.Services;

public class AlbumStoryService(
    IAlbumStoryContext albumStoryContext
    ): IAlbumStoryService
{
    public Task<List<AlbumStoryModel>> GetAlbumStoryByIdAsync(int albumId)
    {
        return albumStoryContext.GetAlbumStoryByIdAsync(albumId);
    }

    public Task<bool> UploadStoryAsyncByAlbumId(int albumId, Stream fileStream, string fileName)
    {
        return albumStoryContext.UploadStoryAsyncByAlbumId(albumId, fileStream, fileName);
    }

    public Task<bool> DeleteStoryAsyncByStoryId(int albumId, int storyId)
    {
        return albumStoryContext.DeleteStoryAsyncByStoryId(albumId, storyId);
    }
    
    public Task<bool> UploadChunkAsyncByAlbumId(int albumId, byte[] chunkData, int chunkIndex, string fileId)
    {
        // Context로 위임
        return albumStoryContext.UploadChunkAsyncByAlbumId(albumId, chunkData, chunkIndex, fileId);
    }

    public Task<bool> FinishChunkUploadAsyncByAlbumId(int albumId, string fileId, string originalFileName)
    {
        // Context로 위임
        return albumStoryContext.FinishChunkUploadAsyncByAlbumId(albumId, fileId, originalFileName);
    }

    public Task<bool> AddFileInfo(int albumId, string fileUri)
    {
        return albumStoryContext.AddFileInfo(albumId, fileUri);
    }
}