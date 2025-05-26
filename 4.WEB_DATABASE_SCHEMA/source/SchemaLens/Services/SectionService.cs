using Microsoft.Data.SqlClient;
using SchemaLens.Client.Enums;
using SchemaLens.Client.Interfaces;
using SchemaLens.Client.Model;

namespace SchemaLens.Services
{
    public class SectionService(
        IDatabaseAccesser db,
        string procedure = "[dbo].[SectionsProcedure]"
        ) : ISectionService
    {
        public async Task<IEnumerable<dynamic>> GetExampleDataByTableNameAsync(string tableName)
        {
            string queryString = $"SELECT TOP 10 * FROM {tableName}";

            return await db.QueryForDynamic(queryString);
        }

        public async Task<List<SectionModel>> GetSectionModelsByObjectIdAsync(int objectId)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R10");
            parameters[1] = new SqlParameter("@ObjectId", objectId);

            return await db.FindData(procedure, parameters, reader => new SectionModel
            {
                Id = reader.GetInt32(0),
                ObjectId = reader.GetInt32(1),
                Order = reader.GetInt32(2),
                Title = reader.GetString(3),
                Content = reader.GetString(4),
                Type = Enum.TryParse(reader.GetString(5), out SectionType type) ? type : SectionType.Unknown
            });
        }
    }
}
