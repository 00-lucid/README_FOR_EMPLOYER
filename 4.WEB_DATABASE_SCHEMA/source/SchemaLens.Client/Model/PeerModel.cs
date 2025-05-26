namespace SchemaLens.Client.Model
{
    public class PeerModel
    {
        public int PeerId { get; set; }
        public string SearchTerm { get; set; }
        public string RelatedTerm { get; set; }
        public bool IsApproved { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public int RegisteredBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string State { get; set; }
        public DateTime? ExamineAt { get; set; }
        public string Username { get; set; }
        public int? ExaminedBy { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string DataType { get; set; }
        public bool IsNull { get; set; }
        public int? Seq { get; set; }
        public string DataSize { get; set; }
        public string DefaultValue { get; set; }

        public override bool Equals(object obj)
        {
            if (obj is PeerModel other)
            {
                return this.PeerId == other.PeerId;
            }
            return false;
        }
    }
}
