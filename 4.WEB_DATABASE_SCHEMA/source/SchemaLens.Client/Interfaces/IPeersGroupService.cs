using SchemaLens.Client.Model;

namespace SchemaLens.Client.Interfaces
{
    public interface IPeersGroupService
    {
        Task<List<PeersGroupModel>> GetPeersGroupByAllAsync();
        Task<List<PeersGroupModel>> GetPeersGroupByPeersGroupId(int peersGroupId);
        Task CreatePeersGroup(string groupName, string discription, int userId);
        Task DeletePeersGroup(int groupId);
        Task<bool> CheckDuplicatePeersGroup(string groupName);
    }
}
