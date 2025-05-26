using IV.Shared.Interfaces.Data;
using IV.Shared.Interfaces.Services;
using IV.Shared.Model;

namespace IV.Web.Services;

public class AlbumShortService(
    IAlbumShortContext shortContext
    ) : IAlbumShortService
{
    public Task<bool> AddFileInfo(int albumId, string fileUri)
    {
        return shortContext.AddFileInfo(albumId, fileUri);
    }

    public Task<List<AlbumShortModel>> GetAlbumShortsByIdAsync(int albumId)
    {
        return shortContext.GetAlbumShortsByIdAsync(albumId);
    }

    public Task<bool> DeleteShortAsyncByShortId(int albumId, int shortId)
    {
        return shortContext.DeleteShortAsyncByShortId(albumId, shortId);
    }

    public Task<bool> RegisterThumbnailAsync(string videoUrl, string thumbnailUrl, int albumId)
    {
        return shortContext.RegisterThumbnailAsync(videoUrl, thumbnailUrl, albumId);
    }
}