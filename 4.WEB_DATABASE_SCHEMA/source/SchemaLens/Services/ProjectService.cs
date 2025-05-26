using Microsoft.Data.SqlClient;
using SchemaLens.Client.Interfaces;
using SchemaLens.Client.Model;

namespace SchemaLens.Services;

public class ProjectService(
        IDatabaseAccesser db,
        string procedure = "[dbo].[ProjectsProcedure]"
    ) : IProjectService
{
    public async Task<List<ProjectModel>> GetProjectById(int projectId)
    {
        SqlParameter[] parameters = new SqlParameter[2];
        parameters[0] = new SqlParameter("@CRUD", "R10");
        parameters[1] = new SqlParameter("@ProjectId", projectId);
        
        return await db.FindData(procedure, parameters, reader => new ProjectModel
        {
            ProjectId = (Int32)reader["ProjectId"],
            ProjectName = (String)reader["ProjectName"],
            Description = (String)reader["Description"],
            CreatedAt = (DateTime)reader["CreatedAt"],
            CreatedBy = (Int32)reader["CreatedBy"],
            Username = (String)reader["Username"],
        });
    }
}