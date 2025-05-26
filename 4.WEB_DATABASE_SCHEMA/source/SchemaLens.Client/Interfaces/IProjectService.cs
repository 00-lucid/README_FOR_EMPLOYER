using SchemaLens.Client.Model;

namespace SchemaLens.Client.Interfaces;

public interface IProjectService
{
    Task<List<ProjectModel>> GetProjectById(int projectId);
}