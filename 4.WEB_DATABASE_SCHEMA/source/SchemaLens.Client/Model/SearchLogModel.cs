namespace SchemaLens.Client.Model
{
    public class SearchLogModel
    {
        int LogId { get; set; }
        string SearchTerm { get; set; }
        int UserId { get; set; }
        DateTime SearchedAt { get; set; }
    }
}
