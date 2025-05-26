using SchemaLens.Client.Model;

namespace SchemaLens.Client.Interfaces
{
    public interface IDatabaseService
    {
        Task<List<TableModel>> GetRelateTable(DatabaseModel model);
    }
}
