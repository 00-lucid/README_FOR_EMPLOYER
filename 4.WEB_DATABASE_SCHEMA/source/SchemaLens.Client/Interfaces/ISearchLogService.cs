namespace SchemaLens.Client.Interfaces
{
    public interface ISearchLogService
    {
        Task CreateSearchLog(string searchTerm, int userId);
    }
}
