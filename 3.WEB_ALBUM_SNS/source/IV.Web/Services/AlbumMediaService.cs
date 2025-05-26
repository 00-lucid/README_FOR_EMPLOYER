using IV.Shared.Interfaces.Data;
using IV.Shared.Interfaces.Services;

namespace IV.Web.Services;

public class AlbumMediaService(
    IAlbumPhotoContext albumPhotoContext,
    IAlbumShortContext albumShortContext
    ) : IAlbumMediaService
{
    
    public async Task<bool> DeleteMediaAsyncByMediaId(int albumId, int mediaId, string mediaType)
    {
        if (mediaType == "photo")
        {
            return await albumPhotoContext.DeletePhotoAsyncByPhotoId(albumId, mediaId);
        }
        else if (mediaType == "short")
        {
            return await albumShortContext.DeleteShortAsyncByShortId(albumId, mediaId);
        }
        else
        {
            return false;
        }
    }
}