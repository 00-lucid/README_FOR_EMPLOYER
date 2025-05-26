using IV.Shared.Interfaces.Data;
using IV.Shared.Interfaces.Services;
using IV.Shared.Model;

namespace IV.Web.Services;

public class AlbumSubscriptionService(
    IAlbumSubscriptionContext albumSubscriptionContext
    ): IAlbumSubscriptionService
{
    public Task<List<AlbumSubscriptionModel>> GetSubscriptionsByUserIdAsync(int userId)
    {
        throw new NotImplementedException();
    }

    public Task<bool> SubscribeToAlbumAsync(int userId, int albumId)
    {
        return albumSubscriptionContext.SubscribeToAlbumAsync(userId, albumId);
    }

    public Task<bool> UnsubscribeFromAlbumAsync(int userId, int albumId)
    {
        return albumSubscriptionContext.UnsubscribeFromAlbumAsync(userId, albumId);
    }

    public Task<bool> IsSubscribedToAlbumAsync(int userId, int albumId)
    {
        return albumSubscriptionContext.IsSubscribedToAlbumAsync(userId, albumId);
    }
}