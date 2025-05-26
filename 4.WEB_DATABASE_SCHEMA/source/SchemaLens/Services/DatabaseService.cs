using Microsoft.Data.SqlClient;
using SchemaLens.Client.Interfaces;
using SchemaLens.Client.Model;

namespace SchemaLens
{
    public class DatabaseService(IDatabaseAccesser db, string procedure = "[dbo].[Databases]") : IDatabaseService
    {
        public async Task<List<TableModel>> GetRelateTable(DatabaseModel model)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R1");
            parameters[1] = new SqlParameter("@SearchTerm", model.Name);

            return null;
        }
    }
}
