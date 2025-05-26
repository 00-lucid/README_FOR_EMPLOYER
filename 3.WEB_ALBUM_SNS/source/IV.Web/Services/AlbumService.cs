using IV.Shared.Interfaces.Data;
using IV.Shared.Model;
using IV.Shared.Interfaces;
using IV.Shared.Interfaces.Services;

namespace IV.Web.Services;

public class AlbumService(
    IAlbumContext albumContext
    ): IAlbumService
{
    public Task<List<AlbumModel>> GetAlbumByUserIdAsync(int userId)
    {
        return albumContext.GetAlbumByUserIdAsync(userId);
    }

    public Task<AlbumModel?> GetAlbumById(int albumId, int userId)
    {
        return albumContext.GetAlbumById(albumId, userId);
    }

    public Task<List<int>> CreateAlbumsAsync(List<AlbumModel> albums)
    {
        return albumContext.CreateAlbumsAsync(albums);
    }

    public Task<List<AlbumModel>> GetAlbumDetailByIdAsync(int albumId)
    {
        return albumContext.GetAlbumDetailByIdAsync(albumId);
    }

    public Task<List<AlbumPhotoModel>> GetAlbumThumbnailByIdAsync(int albumId)
    {
        return albumContext.GetAlbumThumbnailByIdAsync(albumId);
    }

    public Task<bool> DeleteAlbumAsyncById(int albumId)
    {
        return albumContext.DeleteAlbumAsyncById(albumId);
    }

    public Task<bool> UpdateAlbumAsync(AlbumModel album)
    {
        return albumContext.UpdateAlbumAsync(album);
    }

    public Task<List<UserModel>> GetSubscribersByAlbumId(int albumId)
    {
        return albumContext.GetSubscribersByAlbumId(albumId);
    }

    public Task<string> InviteUserToAlbumAsync(string email, int albumId, int senderId)
    {
        return albumContext.InviteUserToAlbumAsync(email, albumId, senderId);
    }

    public Task<bool> ValidateInvitation(string email, string token, DateTime attachDate, int senderId)
    {
        return albumContext.ValidateInvitation(email, token, attachDate, senderId);
    }

    public Task<List<EmailInvitationModel>> GetInvitationByAlbumId(int albumId)
    {
        return albumContext.GetInvitationByAlbumId(albumId);
    }

    public Task<bool> UpdateInvitationStatus(string email, string token, DateTime attachDate, int senderId, string invitationStatus)
    {
        return albumContext.UpdateInvitationStatus(email, token, attachDate, senderId, invitationStatus);
    }
}