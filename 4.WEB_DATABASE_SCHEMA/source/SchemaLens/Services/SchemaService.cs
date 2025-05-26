using Microsoft.Data.SqlClient;
using SchemaLens.Client.Enums;
using SchemaLens.Client.Interfaces;
using SchemaLens.Client.Model;

namespace SchemaLens.Services
{
    public class SchemaService(IDatabaseAccesser db, string procedure = "[dbo].[SchemaProcedure]") : ISchemaService
    {
        SchemaModel model = new SchemaModel();

        public SchemaModel GetSchema()
        {
            return model;
        }

        public async Task<SchemaModel> GetSchemaByKeyword(KeywordModel keywordModel)
        {
            SchemaModel newModel = new SchemaModel();

            newModel.InsertDatabaseModels(await GetDatabaseByKeyword(keywordModel));
            DatabaseModel databaseModel = newModel.GetDatabaseModels()[0];

            newModel.GetDatabaseModels()[0].InsertTableModels(await GetTableByDB(databaseModel));
            List<TableModel> tableModels = databaseModel.GetTableModels();

            foreach (TableModel tableModel in tableModels)
            {
                tableModel.InsertColumnModels(await GetColumnByDB(databaseModel, tableModel));
            }

            model = newModel;

            return newModel;
        }

        public async Task<SchemaModel> GetAllObject()
        {
            model.InsertDatabaseModels(await GetAllDatabase());
            List<DatabaseModel> resultDatabaseModels = model.GetDatabaseModels();

            foreach (DatabaseModel databaseModel in resultDatabaseModels)
            {
                List<TableModel> temp = await GetTableByDB(databaseModel);

                databaseModel.tableModels.AddRange(temp);
            }
            foreach (DatabaseModel databaseModel in resultDatabaseModels)
            {
                foreach (TableModel tableModel in databaseModel.tableModels)
                {
                    List<ColumnModel> temp = await GetColumnByDB(databaseModel, tableModel);

                    tableModel.columnModels.AddRange(temp);
                }
            }

            return model;
        }

        public async Task<List<DatabaseModel>> GetAllDatabase()
        {
            SqlParameter[] parameters = new SqlParameter[1];
            parameters[0] = new SqlParameter("@CRUD", "R1");

            return await db.FindData(procedure, parameters, reader => new DatabaseModel
            {
                Name = reader["Name"] != DBNull.Value ? reader["Name"].ToString() : string.Empty,
                DatabaseId = reader["DatabaseId"] != DBNull.Value ? Convert.ToInt32(reader["DatabaseId"]) : 0,
                SourceDatabaseId = reader["SourceDatabaseId"] != DBNull.Value ? Convert.ToInt32(reader["SourceDatabaseId"]) : null,
                OwnerSid = reader["OwnerSid"] != DBNull.Value ? (byte[])reader["OwnerSid"] : null,
                CreateDate = reader["CreateDate"] != DBNull.Value ? Convert.ToDateTime(reader["CreateDate"]) : DateTime.MinValue,
                CompatibilityLevel = reader["CompatibilityLevel"] != DBNull.Value ? Convert.ToByte(reader["CompatibilityLevel"]) : (byte)0,
                CollationName = reader["CollationName"] != DBNull.Value ? reader["CollationName"].ToString() : string.Empty,
                UserAccess = reader["UserAccess"] != DBNull.Value ? Convert.ToByte(reader["UserAccess"]) : (byte)0,
                UserAccessDesc = reader["UserAccessDesc"] != DBNull.Value ? reader["UserAccessDesc"].ToString() : string.Empty,
                IsReadOnly = reader["IsReadOnly"] != DBNull.Value ? Convert.ToBoolean(reader["IsReadOnly"]) : false,
                IsAutoCloseOn = reader["IsAutoCloseOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoCloseOn"]) : false,
                IsAutoShrinkOn = reader["IsAutoShrinkOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoShrinkOn"]) : false,
                State = reader["State"] != DBNull.Value ? Convert.ToByte(reader["State"]) : (byte)0,
                StateDesc = reader["StateDesc"] != DBNull.Value ? reader["StateDesc"].ToString() : string.Empty,
                IsInStandby = reader["IsInStandby"] != DBNull.Value ? Convert.ToBoolean(reader["IsInStandby"]) : false,
                IsCleanlyShutdown = reader["IsCleanlyShutdown"] != DBNull.Value ? Convert.ToBoolean(reader["IsCleanlyShutdown"]) : false,
                IsSupplementalLoggingEnabled = reader["IsSupplementalLoggingEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsSupplementalLoggingEnabled"]) : false,
                SnapshotIsolationState = reader["SnapshotIsolationState"] != DBNull.Value ? Convert.ToByte(reader["SnapshotIsolationState"]) : (byte)0,
                SnapshotIsolationStateDesc = reader["SnapshotIsolationStateDesc"] != DBNull.Value ? reader["SnapshotIsolationStateDesc"].ToString() : string.Empty,
                IsReadCommittedSnapshotOn = reader["IsReadCommittedSnapshotOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsReadCommittedSnapshotOn"]) : false,
                RecoveryModel = reader["RecoveryModel"] != DBNull.Value ? Convert.ToByte(reader["RecoveryModel"]) : (byte)0,
                RecoveryModelDesc = reader["RecoveryModelDesc"] != DBNull.Value ? reader["RecoveryModelDesc"].ToString() : string.Empty,
                PageVerifyOption = reader["PageVerifyOption"] != DBNull.Value ? Convert.ToByte(reader["PageVerifyOption"]) : (byte)0,
                PageVerifyOptionDesc = reader["PageVerifyOptionDesc"] != DBNull.Value ? reader["PageVerifyOptionDesc"].ToString() : string.Empty,
                IsAutoCreateStatsOn = reader["IsAutoCreateStatsOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoCreateStatsOn"]) : false,
                IsAutoCreateStatsIncrementalOn = reader["IsAutoCreateStatsIncrementalOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoCreateStatsIncrementalOn"]) : false,
                IsAutoUpdateStatsOn = reader["IsAutoUpdateStatsOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoUpdateStatsOn"]) : false,
                IsAutoUpdateStatsAsyncOn = reader["IsAutoUpdateStatsAsyncOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoUpdateStatsAsyncOn"]) : false,
                IsAnsiNullDefaultOn = reader["IsAnsiNullDefaultOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAnsiNullDefaultOn"]) : false,
                IsAnsiNullsOn = reader["IsAnsiNullsOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAnsiNullsOn"]) : false,
                IsAnsiPaddingOn = reader["IsAnsiPaddingOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAnsiPaddingOn"]) : false,
                IsAnsiWarningsOn = reader["IsAnsiWarningsOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAnsiWarningsOn"]) : false,
                IsConcatNullYieldsNullOn = reader["IsConcatNullYieldsNullOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsConcatNullYieldsNullOn"]) : false,
                IsQuotedIdentifierOn = reader["IsQuotedIdentifierOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsQuotedIdentifierOn"]) : false,
                IsRecursiveTriggersOn = reader["IsRecursiveTriggersOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsRecursiveTriggersOn"]) : false,
                IsCursorCloseOnCommitOn = reader["IsCursorCloseOnCommitOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsCursorCloseOnCommitOn"]) : false,
                IsLocalCursorDefault = reader["IsLocalCursorDefault"] != DBNull.Value ? Convert.ToBoolean(reader["IsLocalCursorDefault"]) : false,
                IsFulltextEnabled = reader["IsFulltextEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsFulltextEnabled"]) : false,
                IsTrustworthyOn = reader["IsTrustworthyOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsTrustworthyOn"]) : false,
                IsDbChainingOn = reader["IsDbChainingOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsDbChainingOn"]) : false,
                IsParameterizationForced = reader["IsParameterizationForced"] != DBNull.Value ? Convert.ToBoolean(reader["IsParameterizationForced"]) : false,
                IsMasterKeyEncryptedByServer = reader["IsMasterKeyEncryptedByServer"] != DBNull.Value ? Convert.ToBoolean(reader["IsMasterKeyEncryptedByServer"]) : false,
                IsQueryStoreOn = reader["IsQueryStoreOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsQueryStoreOn"]) : false,
                IsPublished = reader["IsPublished"] != DBNull.Value ? Convert.ToBoolean(reader["IsPublished"]) : false,
                IsMergePublished = reader["IsMergePublished"] != DBNull.Value ? Convert.ToBoolean(reader["IsMergePublished"]) : false,
                IsDistributor = reader["IsDistributor"] != DBNull.Value ? Convert.ToBoolean(reader["IsDistributor"]) : false,
                IsSyncWithBackup = reader["IsSyncWithBackup"] != DBNull.Value ? Convert.ToBoolean(reader["IsSyncWithBackup"]) : false,
                ServiceBrokerGuid = reader["ServiceBrokerGuid"] != DBNull.Value ? (Guid)reader["ServiceBrokerGuid"] : Guid.Empty,
                IsBrokerEnabled = reader["IsBrokerEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsBrokerEnabled"]) : false,
                LogReuseWait = reader["LogReuseWait"] != DBNull.Value ? Convert.ToByte(reader["LogReuseWait"]) : (byte)0,
                LogReuseWaitDesc = reader["LogReuseWaitDesc"] != DBNull.Value ? reader["LogReuseWaitDesc"].ToString() : string.Empty,
                IsDateCorrelationOn = reader["IsDateCorrelationOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsDateCorrelationOn"]) : false,
                IsCdcEnabled = reader["IsCdcEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsCdcEnabled"]) : false,
                IsEncrypted = reader["IsEncrypted"] != DBNull.Value ? Convert.ToBoolean(reader["IsEncrypted"]) : false,
                IsHonorBrokerPriorityOn = reader["IsHonorBrokerPriorityOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsHonorBrokerPriorityOn"]) : false,
                ReplicaId = reader["ReplicaId"] != DBNull.Value ? (Guid)reader["ReplicaId"] : Guid.Empty,
                GroupDatabaseId = reader["GroupDatabaseId"] != DBNull.Value ? (Guid)reader["GroupDatabaseId"] : Guid.Empty,
                ResourcePoolId = reader["ResourcePoolId"] != DBNull.Value ? Convert.ToInt32(reader["ResourcePoolId"]) : 0,
                DefaultLanguageLcid = reader["DefaultLanguageLcid"] != DBNull.Value ? Convert.ToInt32(reader["DefaultLanguageLcid"]) : 0,
                DefaultLanguageName = reader["DefaultLanguageName"] != DBNull.Value ? reader["DefaultLanguageName"].ToString() : string.Empty,
                DefaultFulltextLanguageLcid = reader["DefaultFulltextLanguageLcid"] != DBNull.Value ? Convert.ToInt32(reader["DefaultFulltextLanguageLcid"]) : 0,
                DefaultFulltextLanguageName = reader["DefaultFulltextLanguageName"] != DBNull.Value ? reader["DefaultFulltextLanguageName"].ToString() : string.Empty,
                IsNestedTriggersOn = reader["IsNestedTriggersOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsNestedTriggersOn"]) : false,
                IsTransformNoiseWordsOn = reader["IsTransformNoiseWordsOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsTransformNoiseWordsOn"]) : false,
                TwoDigitYearCutoff = reader["TwoDigitYearCutoff"] != DBNull.Value ? Convert.ToInt32(reader["TwoDigitYearCutoff"]) : 0,
                Containment = reader["Containment"] != DBNull.Value ? Convert.ToByte(reader["Containment"]) : (byte)0,
                ContainmentDesc = reader["ContainmentDesc"] != DBNull.Value ? reader["ContainmentDesc"].ToString() : string.Empty,
                TargetRecoveryTimeInSeconds = reader["TargetRecoveryTimeInSeconds"] != DBNull.Value ? Convert.ToInt32(reader["TargetRecoveryTimeInSeconds"]) : null,
                DelayedDurability = reader["DelayedDurability"] != DBNull.Value ? Convert.ToByte(reader["DelayedDurability"]) : (byte)0,
                DelayedDurabilityDesc = reader["DelayedDurabilityDesc"] != DBNull.Value ? reader["DelayedDurabilityDesc"].ToString() : string.Empty,
                IsMemoryOptimizedElevateToSnapshotOn = reader["IsMemoryOptimizedElevateToSnapshotOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsMemoryOptimizedElevateToSnapshotOn"]) : false,
                IsFederationMember = reader["IsFederationMember"] != DBNull.Value ? Convert.ToBoolean(reader["IsFederationMember"]) : false,
                IsRemoteDataArchiveEnabled = reader["IsRemoteDataArchiveEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsRemoteDataArchiveEnabled"]) : false,
                IsMixedPageAllocationOn = reader["IsMixedPageAllocationOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsMixedPageAllocationOn"]) : false,
                IsTemporalHistoryRetentionEnabled = reader["IsTemporalHistoryRetentionEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsTemporalHistoryRetentionEnabled"]) : false
            });
        }

        public async Task<List<DatabaseModel>> GetDatabaseByKeyword(KeywordModel model)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            switch (model.Type)
            {
                case KeywordType.Database:
                    // ObjectId를 이용해 바로 데이터베이스를 가져온다.
                    parameters[0] = new SqlParameter("@CRUD", "R4");
                    parameters[1] = new SqlParameter("@DbId", model.ObjectId);
                    break;
                case KeywordType.Table:
                    // ParentId를 이용해 바로 데이터베이스를 가져온다.
                    parameters[0] = new SqlParameter("@CRUD", "R5");
                    parameters[1] = new SqlParameter("@ParentId", model.ParentId);
                    break;
                case KeywordType.Column:
                    // DbName을 이용해 테이블을 가져오고 데이터베이스를 가져온다.
                    // 단! DB의 이름 중복은 휴리스틱으로 처리함
                    parameters[0] = new SqlParameter("@CRUD", "R6");
                    parameters[1] = new SqlParameter("@DbName", model.DbName);
                    break;
                default:
                    break;
            }

            return await db.FindData(procedure, parameters, reader => new DatabaseModel
            {
                Name = reader["Name"] != DBNull.Value ? reader["Name"].ToString() : string.Empty,
                DatabaseId = reader["DatabaseId"] != DBNull.Value ? Convert.ToInt32(reader["DatabaseId"]) : 0,
                SourceDatabaseId = reader["SourceDatabaseId"] != DBNull.Value ? Convert.ToInt32(reader["SourceDatabaseId"]) : null,
                OwnerSid = reader["OwnerSid"] != DBNull.Value ? (byte[])reader["OwnerSid"] : null,
                CreateDate = reader["CreateDate"] != DBNull.Value ? Convert.ToDateTime(reader["CreateDate"]) : DateTime.MinValue,
                CompatibilityLevel = reader["CompatibilityLevel"] != DBNull.Value ? Convert.ToByte(reader["CompatibilityLevel"]) : (byte)0,
                CollationName = reader["CollationName"] != DBNull.Value ? reader["CollationName"].ToString() : string.Empty,
                UserAccess = reader["UserAccess"] != DBNull.Value ? Convert.ToByte(reader["UserAccess"]) : (byte)0,
                UserAccessDesc = reader["UserAccessDesc"] != DBNull.Value ? reader["UserAccessDesc"].ToString() : string.Empty,
                IsReadOnly = reader["IsReadOnly"] != DBNull.Value ? Convert.ToBoolean(reader["IsReadOnly"]) : false,
                IsAutoCloseOn = reader["IsAutoCloseOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoCloseOn"]) : false,
                IsAutoShrinkOn = reader["IsAutoShrinkOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoShrinkOn"]) : false,
                State = reader["State"] != DBNull.Value ? Convert.ToByte(reader["State"]) : (byte)0,
                StateDesc = reader["StateDesc"] != DBNull.Value ? reader["StateDesc"].ToString() : string.Empty,
                IsInStandby = reader["IsInStandby"] != DBNull.Value ? Convert.ToBoolean(reader["IsInStandby"]) : false,
                IsCleanlyShutdown = reader["IsCleanlyShutdown"] != DBNull.Value ? Convert.ToBoolean(reader["IsCleanlyShutdown"]) : false,
                IsSupplementalLoggingEnabled = reader["IsSupplementalLoggingEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsSupplementalLoggingEnabled"]) : false,
                SnapshotIsolationState = reader["SnapshotIsolationState"] != DBNull.Value ? Convert.ToByte(reader["SnapshotIsolationState"]) : (byte)0,
                SnapshotIsolationStateDesc = reader["SnapshotIsolationStateDesc"] != DBNull.Value ? reader["SnapshotIsolationStateDesc"].ToString() : string.Empty,
                IsReadCommittedSnapshotOn = reader["IsReadCommittedSnapshotOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsReadCommittedSnapshotOn"]) : false,
                RecoveryModel = reader["RecoveryModel"] != DBNull.Value ? Convert.ToByte(reader["RecoveryModel"]) : (byte)0,
                RecoveryModelDesc = reader["RecoveryModelDesc"] != DBNull.Value ? reader["RecoveryModelDesc"].ToString() : string.Empty,
                PageVerifyOption = reader["PageVerifyOption"] != DBNull.Value ? Convert.ToByte(reader["PageVerifyOption"]) : (byte)0,
                PageVerifyOptionDesc = reader["PageVerifyOptionDesc"] != DBNull.Value ? reader["PageVerifyOptionDesc"].ToString() : string.Empty,
                IsAutoCreateStatsOn = reader["IsAutoCreateStatsOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoCreateStatsOn"]) : false,
                IsAutoCreateStatsIncrementalOn = reader["IsAutoCreateStatsIncrementalOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoCreateStatsIncrementalOn"]) : false,
                IsAutoUpdateStatsOn = reader["IsAutoUpdateStatsOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoUpdateStatsOn"]) : false,
                IsAutoUpdateStatsAsyncOn = reader["IsAutoUpdateStatsAsyncOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAutoUpdateStatsAsyncOn"]) : false,
                IsAnsiNullDefaultOn = reader["IsAnsiNullDefaultOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAnsiNullDefaultOn"]) : false,
                IsAnsiNullsOn = reader["IsAnsiNullsOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAnsiNullsOn"]) : false,
                IsAnsiPaddingOn = reader["IsAnsiPaddingOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAnsiPaddingOn"]) : false,
                IsAnsiWarningsOn = reader["IsAnsiWarningsOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsAnsiWarningsOn"]) : false,
                IsConcatNullYieldsNullOn = reader["IsConcatNullYieldsNullOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsConcatNullYieldsNullOn"]) : false,
                IsQuotedIdentifierOn = reader["IsQuotedIdentifierOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsQuotedIdentifierOn"]) : false,
                IsRecursiveTriggersOn = reader["IsRecursiveTriggersOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsRecursiveTriggersOn"]) : false,
                IsCursorCloseOnCommitOn = reader["IsCursorCloseOnCommitOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsCursorCloseOnCommitOn"]) : false,
                IsLocalCursorDefault = reader["IsLocalCursorDefault"] != DBNull.Value ? Convert.ToBoolean(reader["IsLocalCursorDefault"]) : false,
                IsFulltextEnabled = reader["IsFulltextEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsFulltextEnabled"]) : false,
                IsTrustworthyOn = reader["IsTrustworthyOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsTrustworthyOn"]) : false,
                IsDbChainingOn = reader["IsDbChainingOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsDbChainingOn"]) : false,
                IsParameterizationForced = reader["IsParameterizationForced"] != DBNull.Value ? Convert.ToBoolean(reader["IsParameterizationForced"]) : false,
                IsMasterKeyEncryptedByServer = reader["IsMasterKeyEncryptedByServer"] != DBNull.Value ? Convert.ToBoolean(reader["IsMasterKeyEncryptedByServer"]) : false,
                IsQueryStoreOn = reader["IsQueryStoreOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsQueryStoreOn"]) : false,
                IsPublished = reader["IsPublished"] != DBNull.Value ? Convert.ToBoolean(reader["IsPublished"]) : false,
                IsMergePublished = reader["IsMergePublished"] != DBNull.Value ? Convert.ToBoolean(reader["IsMergePublished"]) : false,
                IsDistributor = reader["IsDistributor"] != DBNull.Value ? Convert.ToBoolean(reader["IsDistributor"]) : false,
                IsSyncWithBackup = reader["IsSyncWithBackup"] != DBNull.Value ? Convert.ToBoolean(reader["IsSyncWithBackup"]) : false,
                ServiceBrokerGuid = reader["ServiceBrokerGuid"] != DBNull.Value ? (Guid)reader["ServiceBrokerGuid"] : Guid.Empty,
                IsBrokerEnabled = reader["IsBrokerEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsBrokerEnabled"]) : false,
                LogReuseWait = reader["LogReuseWait"] != DBNull.Value ? Convert.ToByte(reader["LogReuseWait"]) : (byte)0,
                LogReuseWaitDesc = reader["LogReuseWaitDesc"] != DBNull.Value ? reader["LogReuseWaitDesc"].ToString() : string.Empty,
                IsDateCorrelationOn = reader["IsDateCorrelationOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsDateCorrelationOn"]) : false,
                IsCdcEnabled = reader["IsCdcEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsCdcEnabled"]) : false,
                IsEncrypted = reader["IsEncrypted"] != DBNull.Value ? Convert.ToBoolean(reader["IsEncrypted"]) : false,
                IsHonorBrokerPriorityOn = reader["IsHonorBrokerPriorityOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsHonorBrokerPriorityOn"]) : false,
                ReplicaId = reader["ReplicaId"] != DBNull.Value ? (Guid)reader["ReplicaId"] : Guid.Empty,
                GroupDatabaseId = reader["GroupDatabaseId"] != DBNull.Value ? (Guid)reader["GroupDatabaseId"] : Guid.Empty,
                ResourcePoolId = reader["ResourcePoolId"] != DBNull.Value ? Convert.ToInt32(reader["ResourcePoolId"]) : 0,
                DefaultLanguageLcid = reader["DefaultLanguageLcid"] != DBNull.Value ? Convert.ToInt32(reader["DefaultLanguageLcid"]) : 0,
                DefaultLanguageName = reader["DefaultLanguageName"] != DBNull.Value ? reader["DefaultLanguageName"].ToString() : string.Empty,
                DefaultFulltextLanguageLcid = reader["DefaultFulltextLanguageLcid"] != DBNull.Value ? Convert.ToInt32(reader["DefaultFulltextLanguageLcid"]) : 0,
                DefaultFulltextLanguageName = reader["DefaultFulltextLanguageName"] != DBNull.Value ? reader["DefaultFulltextLanguageName"].ToString() : string.Empty,
                IsNestedTriggersOn = reader["IsNestedTriggersOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsNestedTriggersOn"]) : false,
                IsTransformNoiseWordsOn = reader["IsTransformNoiseWordsOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsTransformNoiseWordsOn"]) : false,
                TwoDigitYearCutoff = reader["TwoDigitYearCutoff"] != DBNull.Value ? Convert.ToInt32(reader["TwoDigitYearCutoff"]) : 0,
                Containment = reader["Containment"] != DBNull.Value ? Convert.ToByte(reader["Containment"]) : (byte)0,
                ContainmentDesc = reader["ContainmentDesc"] != DBNull.Value ? reader["ContainmentDesc"].ToString() : string.Empty,
                TargetRecoveryTimeInSeconds = reader["TargetRecoveryTimeInSeconds"] != DBNull.Value ? Convert.ToInt32(reader["TargetRecoveryTimeInSeconds"]) : null,
                DelayedDurability = reader["DelayedDurability"] != DBNull.Value ? Convert.ToByte(reader["DelayedDurability"]) : (byte)0,
                DelayedDurabilityDesc = reader["DelayedDurabilityDesc"] != DBNull.Value ? reader["DelayedDurabilityDesc"].ToString() : string.Empty,
                IsMemoryOptimizedElevateToSnapshotOn = reader["IsMemoryOptimizedElevateToSnapshotOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsMemoryOptimizedElevateToSnapshotOn"]) : false,
                IsFederationMember = reader["IsFederationMember"] != DBNull.Value ? Convert.ToBoolean(reader["IsFederationMember"]) : false,
                IsRemoteDataArchiveEnabled = reader["IsRemoteDataArchiveEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsRemoteDataArchiveEnabled"]) : false,
                IsMixedPageAllocationOn = reader["IsMixedPageAllocationOn"] != DBNull.Value ? Convert.ToBoolean(reader["IsMixedPageAllocationOn"]) : false,
                IsTemporalHistoryRetentionEnabled = reader["IsTemporalHistoryRetentionEnabled"] != DBNull.Value ? Convert.ToBoolean(reader["IsTemporalHistoryRetentionEnabled"]) : false
            });
        }

        public async Task<List<TableModel>> GetTableByDB(DatabaseModel model)
        {
            SqlParameter[] parameters = new SqlParameter[2];
            parameters[0] = new SqlParameter("@CRUD", "R2");
            parameters[1] = new SqlParameter("@DbName", model.Name);

            return await db.FindData(procedure, parameters, reader => new TableModel
            {
                Name = reader["name"] != DBNull.Value ? reader["name"].ToString() : string.Empty,
                ObjectId = reader["object_id"] != DBNull.Value ? Convert.ToInt32(reader["object_id"]) : 0,
                PrincipalId = reader["principal_id"] != DBNull.Value ? Convert.ToInt32(reader["principal_id"]) : null,
                SchemaId = reader["schema_id"] != DBNull.Value ? Convert.ToInt32(reader["schema_id"]) : 0,
                ParentObjectId = reader["parent_object_id"] != DBNull.Value ? Convert.ToInt32(reader["parent_object_id"]) : 0,
                Type = reader["type"] != DBNull.Value ? reader["type"].ToString() : string.Empty,
                TypeDesc = reader["type_desc"] != DBNull.Value ? reader["type_desc"].ToString() : string.Empty,
                CreateDate = reader["create_date"] != DBNull.Value ? Convert.ToDateTime(reader["create_date"]) : DateTime.MinValue,
                ModifyDate = reader["modify_date"] != DBNull.Value ? Convert.ToDateTime(reader["modify_date"]) : DateTime.MinValue,
                IsMsShipped = reader["is_ms_shipped"] != DBNull.Value ? Convert.ToBoolean(reader["is_ms_shipped"]) : false,
                IsPublished = reader["is_published"] != DBNull.Value ? Convert.ToBoolean(reader["is_published"]) : false,
                IsSchemaPublished = reader["is_schema_published"] != DBNull.Value ? Convert.ToBoolean(reader["is_schema_published"]) : false,
                LobDataSpaceId = reader["lob_data_space_id"] != DBNull.Value ? Convert.ToInt32(reader["lob_data_space_id"]) : null,
                FilestreamDataSpaceId = reader["filestream_data_space_id"] != DBNull.Value ? Convert.ToInt32(reader["filestream_data_space_id"]) : null,
                MaxColumnIdUsed = reader["max_column_id_used"] != DBNull.Value ? Convert.ToInt32(reader["max_column_id_used"]) : 0,
                LockOnBulkLoad = reader["lock_on_bulk_load"] != DBNull.Value ? Convert.ToBoolean(reader["lock_on_bulk_load"]) : false,
                UsesAnsiNulls = reader["uses_ansi_nulls"] != DBNull.Value ? Convert.ToBoolean(reader["uses_ansi_nulls"]) : false,
                IsReplicated = reader["is_replicated"] != DBNull.Value ? Convert.ToBoolean(reader["is_replicated"]) : false,
                HasReplicationFilter = reader["has_replication_filter"] != DBNull.Value ? Convert.ToBoolean(reader["has_replication_filter"]) : false,
                IsMergePublished = reader["is_merge_published"] != DBNull.Value ? Convert.ToBoolean(reader["is_merge_published"]) : false,
                IsSyncTranSubscribed = reader["is_sync_tran_subscribed"] != DBNull.Value ? Convert.ToBoolean(reader["is_sync_tran_subscribed"]) : false,
                HasUncheckedAssemblyData = reader["has_unchecked_assembly_data"] != DBNull.Value ? Convert.ToBoolean(reader["has_unchecked_assembly_data"]) : false,
                TextInRowLimit = reader["text_in_row_limit"] != DBNull.Value ? Convert.ToInt32(reader["text_in_row_limit"]) : 0,
                LargeValueTypesOutOfRow = reader["large_value_types_out_of_row"] != DBNull.Value ? Convert.ToBoolean(reader["large_value_types_out_of_row"]) : false,
                IsTrackedByCdc = reader["is_tracked_by_cdc"] != DBNull.Value ? Convert.ToBoolean(reader["is_tracked_by_cdc"]) : false,
                LockEscalation = reader["lock_escalation"] != DBNull.Value ? Convert.ToByte(reader["lock_escalation"]) : (byte)0,
                LockEscalationDesc = reader["lock_escalation_desc"] != DBNull.Value ? reader["lock_escalation_desc"].ToString() : string.Empty,
                IsFiletable = reader["is_filetable"] != DBNull.Value ? Convert.ToBoolean(reader["is_filetable"]) : false,
                IsMemoryOptimized = reader["is_memory_optimized"] != DBNull.Value ? Convert.ToBoolean(reader["is_memory_optimized"]) : false,
                Durability = reader["durability"] != DBNull.Value ? Convert.ToByte(reader["durability"]) : (byte)0,
                DurabilityDesc = reader["durability_desc"] != DBNull.Value ? reader["durability_desc"].ToString() : string.Empty,
                TemporalType = reader["temporal_type"] != DBNull.Value ? Convert.ToByte(reader["temporal_type"]) : (byte)0,
                TemporalTypeDesc = reader["temporal_type_desc"] != DBNull.Value ? reader["temporal_type_desc"].ToString() : string.Empty,
                HistoryTableId = reader["history_table_id"] != DBNull.Value ? Convert.ToInt32(reader["history_table_id"]) : null,
                IsRemoteDataArchiveEnabled = reader["is_remote_data_archive_enabled"] != DBNull.Value ? Convert.ToBoolean(reader["is_remote_data_archive_enabled"]) : false,
                IsExternal = reader["is_external"] != DBNull.Value ? Convert.ToBoolean(reader["is_external"]) : false,
                HistoryRetentionPeriod = reader["history_retention_period"] != DBNull.Value ? Convert.ToInt32(reader["history_retention_period"]) : null,
                HistoryRetentionPeriodUnit = reader["history_retention_period_unit"] != DBNull.Value ? Convert.ToInt32(reader["history_retention_period_unit"]) : null,
                HistoryRetentionPeriodUnitDesc = reader["history_retention_period_unit_desc"] != DBNull.Value ? reader["history_retention_period_unit_desc"].ToString() : string.Empty,
                IsNode = reader["is_node"] != DBNull.Value ? Convert.ToBoolean(reader["is_node"]) : false,
                IsEdge = reader["is_edge"] != DBNull.Value ? Convert.ToBoolean(reader["is_edge"]) : false
            });

        }

        public async Task<List<ColumnModel>> GetColumnByDB(DatabaseModel model, TableModel tableModel)
        {
            SqlParameter[] parameters = new SqlParameter[3];
            parameters[0] = new SqlParameter("@CRUD", "R3");
            parameters[1] = new SqlParameter("@DbName", model.Name);
            parameters[2] = new SqlParameter("@TableId", tableModel.ObjectId);

            return await db.FindData(procedure, parameters, reader => new ColumnModel
            {
                ObjectId = reader["object_id"] != DBNull.Value ? Convert.ToInt32(reader["object_id"]) : 0,
                Name = reader["name"] != DBNull.Value ? reader["name"].ToString() : string.Empty,
                ColumnId = reader["column_id"] != DBNull.Value ? Convert.ToInt32(reader["column_id"]) : 0,
                SystemTypeId = reader["system_type_id"] != DBNull.Value ? Convert.ToInt32(reader["system_type_id"]) : 0,
                UserTypeId = reader["user_type_id"] != DBNull.Value ? Convert.ToInt32(reader["user_type_id"]) : 0,
                MaxLength = reader["max_length"] != DBNull.Value ? Convert.ToInt16(reader["max_length"]) : (short)0,
                Precision = reader["precision"] != DBNull.Value ? Convert.ToByte(reader["precision"]) : (byte)0,
                Scale = reader["scale"] != DBNull.Value ? Convert.ToByte(reader["scale"]) : (byte)0,
                CollationName = reader["collation_name"] != DBNull.Value ? reader["collation_name"].ToString() : null,
                IsNullable = reader["is_nullable"] != DBNull.Value ? Convert.ToBoolean(reader["is_nullable"]) : false,
                IsAnsiPadded = reader["is_ansi_padded"] != DBNull.Value ? Convert.ToBoolean(reader["is_ansi_padded"]) : false,
                IsRowguidcol = reader["is_rowguidcol"] != DBNull.Value ? Convert.ToBoolean(reader["is_rowguidcol"]) : false,
                IsIdentity = reader["is_identity"] != DBNull.Value ? Convert.ToBoolean(reader["is_identity"]) : false,
                IsComputed = reader["is_computed"] != DBNull.Value ? Convert.ToBoolean(reader["is_computed"]) : false,
                IsFilestream = reader["is_filestream"] != DBNull.Value ? Convert.ToBoolean(reader["is_filestream"]) : false,
                IsReplicated = reader["is_replicated"] != DBNull.Value ? Convert.ToBoolean(reader["is_replicated"]) : false,
                IsNonSqlSubscribed = reader["is_non_sql_subscribed"] != DBNull.Value ? Convert.ToBoolean(reader["is_non_sql_subscribed"]) : false,
                IsMergePublished = reader["is_merge_published"] != DBNull.Value ? Convert.ToBoolean(reader["is_merge_published"]) : false,
                IsDtsReplicated = reader["is_dts_replicated"] != DBNull.Value ? Convert.ToBoolean(reader["is_dts_replicated"]) : false,
                IsXmlDocument = reader["is_xml_document"] != DBNull.Value ? Convert.ToBoolean(reader["is_xml_document"]) : false,
                XmlCollectionId = reader["xml_collection_id"] != DBNull.Value ? Convert.ToInt32(reader["xml_collection_id"]) : 0,
                DefaultObjectId = reader["default_object_id"] != DBNull.Value ? Convert.ToInt32(reader["default_object_id"]) : 0,
                RuleObjectId = reader["rule_object_id"] != DBNull.Value ? Convert.ToInt32(reader["rule_object_id"]) : 0,
                IsSparse = reader["is_sparse"] != DBNull.Value ? Convert.ToBoolean(reader["is_sparse"]) : false,
                IsColumnSet = reader["is_column_set"] != DBNull.Value ? Convert.ToBoolean(reader["is_column_set"]) : false,
                GeneratedAlwaysType = reader["generated_always_type"] != DBNull.Value ? Convert.ToByte(reader["generated_always_type"]) : (byte)0,
                GeneratedAlwaysTypeDesc = reader["generated_always_type_desc"] != DBNull.Value ? reader["generated_always_type_desc"].ToString() : null,
                EncryptionType = reader["encryption_type"] != DBNull.Value ? Convert.ToByte(reader["encryption_type"]) : (byte)0,
                EncryptionTypeDesc = reader["encryption_type_desc"] != DBNull.Value ? reader["encryption_type_desc"].ToString() : null,
                EncryptionAlgorithmName = reader["encryption_algorithm_name"] != DBNull.Value ? reader["encryption_algorithm_name"].ToString() : null,
                ColumnEncryptionKeyId = reader["column_encryption_key_id"] != DBNull.Value ? Convert.ToInt32(reader["column_encryption_key_id"]) : null,
                ColumnEncryptionKeyDatabaseName = reader["column_encryption_key_database_name"] != DBNull.Value ? reader["column_encryption_key_database_name"].ToString() : null,
                IsHidden = reader["is_hidden"] != DBNull.Value ? Convert.ToBoolean(reader["is_hidden"]) : false,
                IsMasked = reader["is_masked"] != DBNull.Value ? Convert.ToBoolean(reader["is_masked"]) : false,
                GraphType = reader["graph_type"] != DBNull.Value ? Convert.ToByte(reader["graph_type"]) : (byte)0,
                GraphTypeDesc = reader["graph_type_desc"] != DBNull.Value ? reader["graph_type_desc"].ToString() : null
            });

        }
    }
}
