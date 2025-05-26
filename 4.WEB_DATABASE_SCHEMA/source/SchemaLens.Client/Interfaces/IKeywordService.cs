using SchemaLens.Client.Model;

namespace SchemaLens.Client.Interfaces
{
    public interface IKeywordService
    {
        Task<List<KeywordModel>> GetKeywordsBySearchTerm(string searchTerm, IEnumerable<string> filters);
    }
}
