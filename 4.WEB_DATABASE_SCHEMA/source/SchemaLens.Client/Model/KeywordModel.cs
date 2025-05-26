using SchemaLens.Client.Enums;

namespace SchemaLens.Client.Model
{
    public class KeywordModel
    {
        public string Name { get; set; }
        public KeywordType Type { get; set; }
        public int ObjectId { get; set; }
        public int ParentId { get; set; }
        public string DbName { get; set; }
    }
}
