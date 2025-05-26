namespace SchemaLens.Client.Interfaces
{
    public interface IPeersGroupMappingService
    {
        public Task CreatePeersGroupMappingAsync(int peersGroupId, int peerId);
        public Task DeletePeersGroupMappingAsync(int peersGroupId, int peerId);
    }
}
