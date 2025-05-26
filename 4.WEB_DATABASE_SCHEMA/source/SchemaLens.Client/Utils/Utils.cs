using SchemaLens.Client.Enums;
using SchemaLens.Client.Model;

namespace SchemaLens.Client.Utils
{
    public static class Common
    {
        public static object? FindObjectById(List<DatabaseModel> databaseModels, int targetObjectId, int targetParentId, KeywordType type)
        {
            foreach (var databaseModel in databaseModels)
            {
                // Check Database level
                if (databaseModel.DatabaseId == targetObjectId)
                {
                    return databaseModel;
                }

                foreach (var table in databaseModel.tableModels)
                {
                    // Check Table level
                    if (table.ObjectId == targetObjectId)
                    {
                        return table;
                    }

                    foreach (var column in table.columnModels)
                    {
                        // Check Column level
                        if (column.ColumnId == targetObjectId && column.ObjectId == targetParentId)
                        {
                            return column;
                        }
                    }
                }
            }

            return null; // Return null if not found
        }

        public static List<object> GetPathToNode(List<DatabaseModel> databaseModels, object target)
        {
            var path = new List<object>();

            foreach (DatabaseModel database in databaseModels)
            {
                if (database == target)
                {
                    path.Add(database);
                    return path;
                }

                foreach (TableModel table in database.tableModels)
                {
                    if (table == target)
                    {
                        path.Add(database);
                        path.Add(table);
                        return path;
                    }

                    foreach (ColumnModel column in table.columnModels)
                    {
                        if (column == target)
                        {
                            path.Add(database);
                            path.Add(table);
                            path.Add(column);
                            return path;
                        }
                    }
                }
            }

            return path;
        }

        public static string GetTimeElapsedText(DateTime? createdAt)
        {
            if (createdAt == null)
            {
                return "날짜 정보가 없습니다.";
            }

            // null이 아니라면 .Value를 사용해 DateTime으로 접근
            var timeSpan = DateTime.Now - createdAt.Value;

            if (timeSpan.TotalSeconds < 60)
            {
                return $"{(int)timeSpan.TotalSeconds}초 전";
            }
            else if (timeSpan.TotalMinutes < 60)
            {
                return $"{(int)timeSpan.TotalMinutes}분 전";
            }
            else if (timeSpan.TotalHours < 24)
            {
                return $"{(int)timeSpan.TotalHours}시간 전";
            }
            else if (timeSpan.TotalDays < 30)
            {
                return $"{(int)timeSpan.TotalDays}일 전";
            }
            else if (timeSpan.TotalDays < 365)
            {
                return $"{(int)(timeSpan.TotalDays / 30)}개월 전";
            }
            else
            {
                return $"{(int)(timeSpan.TotalDays / 365)}년 전";
            }
        }
    }
}
