using Microsoft.Data.SqlClient;
using SchemaLens.Client.Enums;
using SchemaLens.Client.Interfaces;
using SchemaLens.Client.Model;

namespace SchemaLens.Services
{
    public class PeerService(
        IDatabaseAccesser db,
        string procedure = "[dbo].[PeersProcedure]"
        ) : IPeerService
    {
        public async Task<List<PeerModel>> GetPeersByRegisteredAsync(int registeredBy)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R10");
            parameters[1] = new SqlParameter("@RegisteredBy", registeredBy);

            return await db.FindData(procedure, parameters, reader => new PeerModel
            {
                PeerId = (Int32)reader["PeerId"],
                SearchTerm = (string)reader["SearchTerm"],
                RelatedTerm = (string)reader["RelatedTerm"],
                IsApproved = (bool)reader["IsApproved"],
                ApprovedAt = reader["ApprovedAt"] as DateTime?,
                RegisteredBy = (int)reader["RegisteredBy"],
                CreatedAt = (DateTime)reader["CreatedAt"],
                State = (string)reader["State"],
                ExamineAt = reader["ExamineAt"] as DateTime?,
                Username = (string)reader["Username"],
                ExaminedBy = reader["ExaminedBy"] as int?,
                UpdatedAt = (DateTime)reader["UpdatedAt"],
                DataType = (string)reader["DataType"],
                IsNull = (bool)reader["IsNull"],
                Seq = null,
                DataSize = (string)reader["DataSize"],
                DefaultValue = (string)reader["DefaultValue"],

            });
        }

        public async Task<List<PeerModel>> GetPeersByAllAsync()
        {
            SqlParameter[] parameters = new SqlParameter[1];
            parameters[0] = new SqlParameter("@CRUD", "R20");

            return await db.FindData(procedure, parameters, reader => new PeerModel
            {
                PeerId = (Int32)reader["PeerId"],
                SearchTerm = (string)reader["SearchTerm"],
                RelatedTerm = (string)reader["RelatedTerm"],
                IsApproved = (bool)reader["IsApproved"],
                ApprovedAt = reader["ApprovedAt"] as DateTime?,
                RegisteredBy = (int)reader["RegisteredBy"],
                CreatedAt = (DateTime)reader["CreatedAt"],
                State = (string)reader["State"],
                ExamineAt = reader["ExamineAt"] as DateTime?,
                Username = (string)reader["Username"],
                ExaminedBy = reader["ExaminedBy"] as int?,
                UpdatedAt = (DateTime)reader["UpdatedAt"],
                DataType = (string)reader["DataType"],
                IsNull = (bool)reader["IsNull"],
                Seq = null,
                DataSize = (string)reader["DataSize"],
                DefaultValue = (string)reader["DefaultValue"],

            });
        }

        public async Task<List<PeerModel>> GetPeersByAllOfIsApproved()
        {
            SqlParameter[] parameters = new SqlParameter[1];
            parameters[0] = new SqlParameter("@CRUD", "R60");

            return await db.FindData(procedure, parameters, reader => new PeerModel
            {
                PeerId = (Int32)reader["PeerId"],
                SearchTerm = (string)reader["SearchTerm"],
                RelatedTerm = (string)reader["RelatedTerm"],
                IsApproved = (bool)reader["IsApproved"],
                ApprovedAt = reader["ApprovedAt"] as DateTime?,
                RegisteredBy = (int)reader["RegisteredBy"],
                CreatedAt = (DateTime)reader["CreatedAt"],
                State = (string)reader["State"],
                ExamineAt = reader["ExamineAt"] as DateTime?,
                Username = (string)reader["Username"],
                ExaminedBy = reader["ExaminedBy"] as int?,
                UpdatedAt = (DateTime)reader["UpdatedAt"],
                DataType = (string)reader["DataType"],
                IsNull = (bool)reader["IsNull"],
                Seq = null,
                DataSize = (string)reader["DataSize"],
                DefaultValue = (string)reader["DefaultValue"],

            });
        }


        public async Task<List<PeerModel>> GetPeersBySearchTerm(string searchTerm)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R30");
            parameters[1] = new SqlParameter("@SearchTerm", searchTerm);

            return await db.FindData(procedure, parameters, reader => new PeerModel
            {
                PeerId = (Int32)reader["PeerId"],
                SearchTerm = (string)reader["SearchTerm"],
                RelatedTerm = (string)reader["RelatedTerm"],
                IsApproved = (bool)reader["IsApproved"],
                ApprovedAt = reader["ApprovedAt"] as DateTime?,
                RegisteredBy = (int)reader["RegisteredBy"],
                CreatedAt = (DateTime)reader["CreatedAt"],
                State = (string)reader["State"],
                ExamineAt = reader["ExamineAt"] as DateTime?,
                Username = (string)reader["Username"],
                ExaminedBy = reader["ExaminedBy"] as int?,
                UpdatedAt = (DateTime)reader["UpdatedAt"],
                DataType = (string)reader["DataType"],
                IsNull = (bool)reader["IsNull"],
                Seq = null,
                DataSize = (string)reader["DataSize"],
                DefaultValue = (string)reader["DefaultValue"],

            });
        }

        public async Task UpdatePeerStateByIdAsync(int peerId, PeerType peerType)
        {
            SqlParameter[] parameters = new SqlParameter[4];
            parameters[0] = new SqlParameter("@CRUD", "U10");
            parameters[1] = new SqlParameter("@PeerId", peerId);
            parameters[2] = new SqlParameter("@State", peerType.ToString());
            parameters[3] = new SqlParameter("@UserId", 1);

            await db.UpdateData(procedure, parameters);
        }

        public async Task CreatePeer(string searchTerm, string relatedTerm, int userId, string dataType, bool isNull, string dataSize, string defaultValue)
        {
            SqlParameter[] parameters = new SqlParameter[8];
            parameters[0] = new SqlParameter("@CRUD", "C10");
            parameters[1] = new SqlParameter("@SearchTerm", searchTerm);
            parameters[2] = new SqlParameter("@RelatedTerm", relatedTerm);
            parameters[3] = new SqlParameter("@UserId", userId);
            parameters[4] = new SqlParameter("@DataType", dataType);
            parameters[5] = new SqlParameter("@IsNull", isNull);
            parameters[6] = new SqlParameter("@DataSize", dataSize);
            parameters[7] = new SqlParameter("@DefaultValue", defaultValue);

            await db.SaveData(procedure, parameters);
        }

        public async Task<List<PeerModel>> GetPeersOfCreatedRecent()
        {
            SqlParameter[] parameters = new SqlParameter[1];
            parameters[0] = new SqlParameter("@CRUD", "R40");

            return await db.FindData(procedure, parameters, reader => new PeerModel
            {
                PeerId = (Int32)reader["PeerId"],
                SearchTerm = (string)reader["SearchTerm"],
                RelatedTerm = (string)reader["RelatedTerm"],
                IsApproved = (bool)reader["IsApproved"],
                ApprovedAt = reader["ApprovedAt"] as DateTime?,
                RegisteredBy = (int)reader["RegisteredBy"],
                CreatedAt = (DateTime)reader["CreatedAt"],
                State = (string)reader["State"],
                ExamineAt = reader["ExamineAt"] as DateTime?,
                Username = (string)reader["Username"],
                ExaminedBy = reader["ExaminedBy"] as int?,
                UpdatedAt = (DateTime)reader["UpdatedAt"],
                DataType = (string)reader["DataType"],
                IsNull = (bool)reader["IsNull"],
                Seq = null,
                DataSize = (string)reader["DataSize"],
                DefaultValue = (string)reader["DefaultValue"],


            });
        }

        public async Task UpdatePeerByIdAsync(int peerId, string searchTerm, string relatedTerm, string dataType, bool isNull)
        {
            SqlParameter[] parameters = new SqlParameter[6];
            parameters[0] = new SqlParameter("@CRUD", "U20");
            parameters[1] = new SqlParameter("@PeerId", peerId);
            parameters[2] = new SqlParameter("@SearchTerm", searchTerm);
            parameters[3] = new SqlParameter("@RelatedTerm", relatedTerm);
            parameters[4] = new SqlParameter("@DataType", dataType);
            parameters[5] = new SqlParameter("@IsNull", isNull);

            await db.UpdateData(procedure, parameters);
        }

        public async Task DeletePeerById(int peerId)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "D10");
            parameters[1] = new SqlParameter("@PeerId", peerId);

            await db.DestroyData(procedure, parameters);
        }

        public async Task<List<PeerModel>> GetPeersGropMappingByPeersGroupId(int peersGroupId)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R50");
            parameters[1] = new SqlParameter("@PeersGroupId", peersGroupId);

            return await db.FindData(procedure, parameters, reader => new PeerModel
            {
                PeerId = (Int32)reader["PeerId"],
                SearchTerm = (string)reader["SearchTerm"],
                RelatedTerm = (string)reader["RelatedTerm"],
                IsApproved = (bool)reader["IsApproved"],
                ApprovedAt = reader["ApprovedAt"] as DateTime?,
                RegisteredBy = (int)reader["RegisteredBy"],
                CreatedAt = (DateTime)reader["CreatedAt"],
                State = (string)reader["State"],
                ExamineAt = reader["ExamineAt"] as DateTime?,
                Username = (string)reader["Username"],
                ExaminedBy = reader["ExaminedBy"] as int?,
                UpdatedAt = (DateTime)reader["UpdatedAt"],
                DataType = (string)reader["DataType"],
                IsNull = (bool)reader["IsNull"],
                Seq = reader["Seq"] as int?,
                DataSize = (string)reader["DataSize"],
                DefaultValue = (string)reader["DefaultValue"],

            });
        }

        public async Task<bool> CheckDuplicatePeer(string relatedTerm)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R70");
            parameters[1] = new SqlParameter("@RelatedTerm", relatedTerm);
            
            return await db.CheckDataExists(procedure, parameters);
        }

        public async Task<List<PeerModel>> GetPeersByLikeSearchTerm(string searchTerm)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R80");
            parameters[1] = new SqlParameter("@SearchTerm", searchTerm);
            
            return await db.FindData(procedure, parameters, reader => new PeerModel
            {
                PeerId = (Int32)reader["PeerId"],
                SearchTerm = (string)reader["SearchTerm"],
                RelatedTerm = (string)reader["RelatedTerm"],
                IsApproved = (bool)reader["IsApproved"],
                ApprovedAt = reader["ApprovedAt"] as DateTime?,
                RegisteredBy = (int)reader["RegisteredBy"],
                CreatedAt = (DateTime)reader["CreatedAt"],
                State = (string)reader["State"],
                ExamineAt = reader["ExamineAt"] as DateTime?,
                Username = (string)reader["Username"],
                ExaminedBy = reader["ExaminedBy"] as int?,
                UpdatedAt = (DateTime)reader["UpdatedAt"],
                DataType = (string)reader["DataType"],
                IsNull = (bool)reader["IsNull"],
                Seq = null,
                DataSize = (string)reader["DataSize"],
                DefaultValue = (string)reader["DefaultValue"],

            });
        }
    }
}
