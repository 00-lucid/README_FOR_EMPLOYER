using SchemaLens.Client.Model;

namespace SchemaLens.Client.Interfaces
{
    public interface ISchemaService
    {
        SchemaModel GetSchema();
        public Task<SchemaModel> GetSchemaByKeyword(KeywordModel model);
        public Task<SchemaModel> GetAllObject();
        public Task<List<DatabaseModel>> GetAllDatabase();
        public Task<List<DatabaseModel>> GetDatabaseByKeyword(KeywordModel model);
        public Task<List<TableModel>> GetTableByDB(DatabaseModel model);
        public Task<List<ColumnModel>> GetColumnByDB(DatabaseModel model, TableModel tableModel);
    }
}
