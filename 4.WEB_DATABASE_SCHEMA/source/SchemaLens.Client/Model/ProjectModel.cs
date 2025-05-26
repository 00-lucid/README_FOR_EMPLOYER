namespace SchemaLens.Client.Model
{
    public class ProjectModel
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public int CreatedBy { get; set; }
        public string Username { get; set; }
    }
}
