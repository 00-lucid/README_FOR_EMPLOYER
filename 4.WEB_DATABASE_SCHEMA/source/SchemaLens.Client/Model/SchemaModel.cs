namespace SchemaLens.Client.Model
{
    public class SchemaModel
    {
        List<DatabaseModel> databaseModels;

        public List<DatabaseModel> GetDatabaseModels() { return databaseModels; }

        public void InsertDatabaseModels(List<DatabaseModel> models)
        {
            databaseModels = models;
        }
    }
}
