using Microsoft.Data.SqlClient;
using SchemaLens.Client.Interfaces;

namespace SchemaLens.Services
{
    public class PeersGroupMappingService(
            IDatabaseAccesser db,
            string procedure = "[dbo].[PeersGroupMappingProcedure]"
        ) : IPeersGroupMappingService
    {
        public async Task CreatePeersGroupMappingAsync(int peersGroupId, int peerId)
        {
            SqlParameter[] parameters = new SqlParameter[3];
            parameters[0] = new SqlParameter("@CRUD", "C10");
            parameters[1] = new SqlParameter("@PeersGroupId", peersGroupId);
            parameters[2] = new SqlParameter("@PeerId", peerId);

            await db.SaveData(procedure, parameters);
        }

        public async Task DeletePeersGroupMappingAsync(int peersGroupId, int peerId)
        {
            SqlParameter[] parameters = new SqlParameter[3];
            parameters[0] = new SqlParameter("@CRUD", "D10");
            parameters[1] = new SqlParameter("@PeersGroupId", peersGroupId);
            parameters[2] = new SqlParameter("@PeerId", peerId);

            await db.DestroyData(procedure, parameters);
        }
    }
}
