using SchemaLens.Client.Enums;
using SchemaLens.Client.Model;

namespace SchemaLens.Client.Interfaces
{
    public interface IPeerService
    {
        Task<List<PeerModel>> GetPeersByRegisteredAsync(int registeredBy);
        Task<List<PeerModel>> GetPeersByAllAsync();
        Task<List<PeerModel>> GetPeersByAllOfIsApproved();
        Task<List<PeerModel>> GetPeersBySearchTerm(string searchTerm);
        Task UpdatePeerStateByIdAsync(int peerId, PeerType peerType);
        Task UpdatePeerByIdAsync(int peerId, string searchTerm, string relatedTerm, string dataType, bool isNull);
        Task CreatePeer(string searchTerm, string relatedTerm, int userId, string dataType, bool isNull, string dataSize, string defaultValue);
        Task<List<PeerModel>> GetPeersOfCreatedRecent();
        Task DeletePeerById(int peerId);
        Task<List<PeerModel>> GetPeersGropMappingByPeersGroupId(int peersGroupId);
        Task<bool> CheckDuplicatePeer(string relatedTerm);
        Task<List<PeerModel>> GetPeersByLikeSearchTerm(string searchTerm);
    }
}
