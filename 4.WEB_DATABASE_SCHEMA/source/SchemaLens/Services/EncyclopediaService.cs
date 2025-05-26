using Microsoft.Data.SqlClient;
using SchemaLens.Client.Interfaces;
using SchemaLens.Client.Model;

namespace SchemaLens.Services
{
    public class EncyclopediaService(
        IDatabaseAccesser db,
        string procedure = "[dbo].[EncyclopediaProcedure]"
        ) : IEncyclopediaService
    {
        public async Task<List<EncyclopediaModel>> GetEncycloBySearchTerm(string searchTerm)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R10");
            parameters[1] = new SqlParameter("@SearchTerm", searchTerm);

            return await db.FindData(procedure, parameters, reader => new EncyclopediaModel
            {
                Id = reader.GetInt32(0),
                SearchTerm = reader.GetString(1),
                RelatedTerm = reader.GetString(2),
                RelevanceWeight = reader.GetInt32(3),
                CreatedAt = reader.GetDateTime(4)
            });
        }
    }
}
