using SchemaLens.Client.Enums;

namespace SchemaLens.Client.Model
{
    public class SectionModel
    {
        public int Id { get; set; }
        public int ObjectId{ get; set; }
        public int Order { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public SectionType Type { get; set; }
    }
}
