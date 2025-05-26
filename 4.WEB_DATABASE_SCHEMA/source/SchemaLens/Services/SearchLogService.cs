using Microsoft.Data.SqlClient;
using SchemaLens.Client.Interfaces;

namespace SchemaLens.Services
{
    public class SearchLogService(
            IDatabaseAccesser db,
            string procedure = "[dbo].[SearchLogProcedure]"
        ) : ISearchLogService
    {
        public async Task CreateSearchLog(string searchTerm, int userId)
        {
            SqlParameter[] parameters = new SqlParameter[3];
            parameters[0] = new SqlParameter("@CRUD", "C10");
            parameters[1] = new SqlParameter("@SearchTerm", searchTerm);
            parameters[2] = new SqlParameter("@UserId", userId);

            await db.SaveData(procedure, parameters);
        }
    }
}
