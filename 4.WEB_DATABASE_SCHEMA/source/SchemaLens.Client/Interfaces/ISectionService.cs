using SchemaLens.Client.Model;

namespace SchemaLens.Client.Interfaces
{
    public interface ISectionService
    {
        Task<List<SectionModel>> GetSectionModelsByObjectIdAsync(int ObjectId);
        Task<IEnumerable<dynamic>> GetExampleDataByTableNameAsync(string tableName);
    }
}
