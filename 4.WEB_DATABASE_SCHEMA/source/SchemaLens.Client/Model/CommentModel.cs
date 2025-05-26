namespace SchemaLens.Client.Model
{
    public class CommentModel
    {
        public int Id { get; set; }
        public int ObjectId { get; set; }
        public string Text { get; set; }
        public DateTime CreateAt { get; set; }
        public string Writer { get; set; }
    }
}
