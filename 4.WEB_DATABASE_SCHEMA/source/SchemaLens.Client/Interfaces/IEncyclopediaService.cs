using SchemaLens.Client.Model;

namespace SchemaLens.Client.Interfaces
{
    public interface IEncyclopediaService
    {
        Task<List<EncyclopediaModel>> GetEncycloBySearchTerm(string searchTerm);
    }
}
