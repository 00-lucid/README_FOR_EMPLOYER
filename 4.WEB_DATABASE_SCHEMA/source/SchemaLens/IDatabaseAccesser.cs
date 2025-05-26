using Microsoft.Data.SqlClient;

namespace SchemaLens
{
    public interface IDatabaseAccesser
    {
        Task<List<T>> FindData<T>(string procedure, SqlParameter[] parameters, Func<SqlDataReader, T> map);
        Task SaveData(string procedure, SqlParameter[] parameters);
        Task DestroyData(string procedure, SqlParameter[] parameters);
        Task UpdateData(string procedure, SqlParameter[] parameters);
        Task<IEnumerable<dynamic>> QueryForDynamic(string queryString);
        Task<bool> CheckDataExists(string procedure, SqlParameter[] parameters);
    }
}
