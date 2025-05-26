using Microsoft.Data.SqlClient;
using SchemaLens.Client.Interfaces;
using SchemaLens.Client.Model;

namespace SchemaLens.Services
{
    public class CommentService(
        IDatabaseAccesser db,
        string procedure = "[dbo].[CommentsProcedure]"
    ) : ICommentService
    {
        public async Task<List<CommentModel>> GetCommentsByObjectIdAsync(int objectId)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R10");
            parameters[1] = new SqlParameter("@ObjectId", objectId);

            return await db.FindData(procedure, parameters, reader => new CommentModel
            {
                Id = reader.GetInt32(0),
                ObjectId = reader.GetInt32(1),
                Text = reader.GetString(2),
                CreateAt = reader.GetDateTime(3),
                Writer = reader.GetString(4)
            });
        }

        public async Task PostCommentsByIpAsync(int objectId, string text, string ip)
        {
            SqlParameter[] parameters = new SqlParameter[4];
            parameters[0] = new SqlParameter("@CRUD", "C10");
            parameters[1] = new SqlParameter("@ObjectId", objectId);
            parameters[2] = new SqlParameter("@Text", text);
            parameters[3] = new SqlParameter("@Writer", ip);

            await db.SaveData(procedure, parameters);
        }
    }
}
