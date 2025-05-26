using Microsoft.Data.SqlClient;
using SchemaLens.Client.Interfaces;
using SchemaLens.Client.Model;

namespace SchemaLens.Services
{

    public class PeersGroupService(
                IDatabaseAccesser db,
                string procedure = "[dbo].[PeersGroupProcedure]"
        ) : IPeersGroupService
    {
        public async Task CreatePeersGroup(string groupName, string discription, int userId)
        {
            SqlParameter[] parameters = new SqlParameter[4];
            parameters[0] = new SqlParameter("@CRUD", "C10");
            parameters[1] = new SqlParameter("@GroupName", groupName);
            parameters[2] = new SqlParameter("@Discription", discription);
            parameters[3] = new SqlParameter("@UserId", userId);

            await db.SaveData(procedure, parameters);
        }

        public async Task DeletePeersGroup(int groupId)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "D10");
            parameters[1] = new SqlParameter("@PeersGroupId", groupId);
            
            await db.DestroyData(procedure, parameters);
        }

        public async Task<bool> CheckDuplicatePeersGroup(string groupName)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R30");
            parameters[1] = new SqlParameter("@GroupName", groupName);
            
            return await db.CheckDataExists(procedure, parameters);
        }

        public async Task<List<PeersGroupModel>> GetPeersGroupByAllAsync()
        {
            SqlParameter[] parameters = new SqlParameter[1];
            parameters[0] = new SqlParameter("@CRUD", "R10");

            return await db.FindData(procedure, parameters, reader => new PeersGroupModel
            {
                PeersGroupId = (Int32)reader["PeersGroupId"],
                GroupName = (string)reader["GroupName"],
                Description = (string)reader["Description"],
                CreatedAt = (DateTime)reader["CreatedAt"],
                CreatedBy = (Int32)reader["CreatedBy"],
                Username = (string)reader["Username"]
            });
        }

        public async Task<List<PeersGroupModel>> GetPeersGroupByPeersGroupId(int PeersGroupId)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R20");
            parameters[1] = new SqlParameter("@PeersGroupId", PeersGroupId);

            return await db.FindData(procedure, parameters, reader => new PeersGroupModel
            {
                PeersGroupId = (Int32)reader["PeersGroupId"],
                GroupName = (string)reader["GroupName"],
                Description = (string)reader["Description"],
                CreatedAt = (DateTime)reader["CreatedAt"],
                CreatedBy = (Int32)reader["CreatedBy"],
                Username = (string)reader["Username"]
            });
        }
    }
}
