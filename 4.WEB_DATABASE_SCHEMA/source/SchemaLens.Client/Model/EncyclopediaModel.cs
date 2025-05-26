namespace SchemaLens.Client.Model
{
    public class EncyclopediaModel
    {
        public int Id { get; set; }
        public string SearchTerm { get; set; }
        public string RelatedTerm { get; set; }
        public int RelevanceWeight { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
