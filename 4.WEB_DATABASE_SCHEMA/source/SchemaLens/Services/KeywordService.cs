using Microsoft.Data.SqlClient;
using SchemaLens.Client.Enums;
using SchemaLens.Client.Interfaces;
using SchemaLens.Client.Model;

namespace SchemaLens.Services
{
    public class KeywordService(
        IDatabaseAccesser db,
        string procedure = "[dbo].[KeywordsProcedure]"
    ) : IKeywordService
    {
        public async Task<List<KeywordModel>> GetKeywordsBySearchTerm(string searchTerm, IEnumerable<string> filters)
        {
            SqlParameter[] parameters = new SqlParameter[3];
            parameters[0] = new SqlParameter("@CRUD", "R1");
            parameters[1] = new SqlParameter("@SearchTerm", searchTerm);

            string filterString = string.Join(",", filters);
            parameters[2] = new SqlParameter("@Filters", filterString);



            return await db.FindData(procedure, parameters, reader => new KeywordModel
            {
                Name = reader.GetString(0),
                Type = Enum.TryParse(reader.GetString(1), out KeywordType type) ? type : KeywordType.Unknown,  // DefaultValue는 enum의 기본값
                ObjectId = reader.GetInt32(2),
                ParentId = reader.IsDBNull(3) ? 0 : reader.GetInt32(3),
                DbName = reader.GetString(4)
            });
        }
        //public async Task<List<KeywordModel>> GetKeywordsForTree(int keywordId)
        //{
        //    SqlParameter[] parameters = new SqlParameter[2];
        //    parameters[0] = new SqlParameter("@CRUD", "R2");
        //    parameters[1] = new SqlParameter("@FindId", keywordId);

        //    return await db.FindData(procedure, parameters, reader => new KeywordModel
        //    {
        //        Id = reader.GetInt32(0),
        //        Keyword = reader.GetString(1),
        //        Type = Enum.TryParse(reader.GetString(2), out KeywordType type) ? type : KeywordType.Unknown,  // DefaultValue는 enum의 기본값
        //    });
        //}
    }
}
