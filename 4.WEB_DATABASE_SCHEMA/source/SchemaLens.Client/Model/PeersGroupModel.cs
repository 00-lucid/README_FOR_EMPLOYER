namespace SchemaLens.Client.Model
{
    public class PeersGroupModel
    {
        public int PeersGroupId { get; set; }
        public string GroupName { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedBy { get; set; }
        public string Username { get; set; }
    }
}
