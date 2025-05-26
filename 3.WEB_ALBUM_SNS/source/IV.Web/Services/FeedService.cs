using IV.Shared.Interfaces.Data;
using IV.Shared.Interfaces.Services;
using IV.Shared.Model;

namespace IV.Web.Services;

public class FeedService(
    IFeedContext feedContext
    ): IFeedService
{
    public Task<FeedModel?> GetFeedByIdAsync(int feedId)
    {
        throw new NotImplementedException();
    }

    public Task<List<FeedModel>> GetFeedsByAlbumIdAsync(int albumId)
    {
        throw new NotImplementedException();
    }

    public Task<int> CreateFeedAsync(int albumId, int creatorUserId, string body)
    {
        return feedContext.CreateFeedAsync(albumId, creatorUserId, body);
    }

    public Task<bool> CreateFeedAlbumPhotoAsync(int feedId, int photoId, int sortOrder)
    {
        return feedContext.CreateFeedAlbumPhotoAsync(feedId, photoId, sortOrder);
    }

    public Task<bool> CreateFeedAlbumShortAsync(int feedId, int shortId, int sortOrder)
    {
        return feedContext.CreateFeedAlbumShortAsync(feedId, shortId, sortOrder);
    }

    public Task<bool> UpdateLikeCountAsync(int feedId, int likeCount)
    {
        throw new NotImplementedException();
    }

    public Task<bool> UpdateCommentCountAsync(int feedId, int commentCount)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteFeedAsync(int feedId)
    {
        throw new NotImplementedException();
    }

    public Task<List<FeedModel>> GetFeedsBySubscription(int userId)
    {
        return feedContext.GetFeedsBySubscription(userId);
    }

    public Task<List<string>> GetFeedsAlbumPhotoAsync(int feedId)
    {
        return feedContext.GetFeedsAlbumPhotoAsync(feedId);
    }

    public Task<List<string>> GetFeedsAlbumShortAsync(int feedId)
    {
        return feedContext.GetFeedsAlbumShortAsync(feedId);
    }

    public Task<List<FeedMedia>> GetFeedMediasAsync(int feedId)
    {
        return feedContext.GetFeedMediasAsync(feedId);
    }

    public Task<bool> ToggleLikeFeedAsync(int userId, int feedId)
    {
        return feedContext.ToggleLikeFeedAsync(userId, feedId);
    }

    public Task<bool> GetLikeFeedAsync(int userId, int feedId)
    {
        return feedContext.GetLikeFeedAsync(userId, feedId);
    }

    public Task<List<FeedCommentModel>> GetFeedCommentsAsync(int feedId)
    {
        return feedContext.GetFeedCommentsAsync(feedId);
    }

    public Task<int> GetFeedCommentCountAsync(int feedId)
    {
        return feedContext.GetFeedCommentCountAsync(feedId);
    }

    public Task<bool> AddFeedCommentAsync(int feedId, string content, int userId)
    {
        return feedContext.AddFeedCommentAsync(feedId, content, userId);
    }
}