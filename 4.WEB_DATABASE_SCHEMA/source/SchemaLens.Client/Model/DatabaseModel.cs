namespace SchemaLens.Client.Model
{
    public class DatabaseModel
    {
        public List<TableModel> tableModels { get; set; } = [];

        public string Name { get; set; }  // Name of database
        public int DatabaseId { get; set; }  // ID of the database
        public int? SourceDatabaseId { get; set; }  // ID of the source database of this database snapshot
        public byte[] OwnerSid { get; set; }  // SID of the external owner
        public DateTime CreateDate { get; set; }  // Date the database was created or renamed
        public byte CompatibilityLevel { get; set; }  // Compatibility level of the database
        public string CollationName { get; set; }  // Collation of the database
        public byte UserAccess { get; set; }  // User-access setting
        public string UserAccessDesc { get; set; }  // Description of user-access setting
        public bool IsReadOnly { get; set; }  // Indicates if the database is read-only
        public bool IsAutoCloseOn { get; set; }  // Indicates if auto-close is enabled
        public bool IsAutoShrinkOn { get; set; }  // Indicates if auto-shrink is enabled
        public byte State { get; set; }  // Database state value
        public string StateDesc { get; set; }  // Description of the database state
        public bool IsInStandby { get; set; }  // Indicates if the database is in standby
        public bool IsCleanlyShutdown { get; set; }  // Indicates if the database shut down cleanly
        public bool IsSupplementalLoggingEnabled { get; set; }  // Indicates if supplemental logging is enabled
        public byte SnapshotIsolationState { get; set; }  // State of snapshot-isolation transactions
        public string SnapshotIsolationStateDesc { get; set; }  // Description of snapshot isolation state
        public bool IsReadCommittedSnapshotOn { get; set; }  // Indicates if read-committed snapshot is enabled
        public byte RecoveryModel { get; set; }  // Recovery model of the database
        public string RecoveryModelDesc { get; set; }  // Description of the recovery model
        public byte PageVerifyOption { get; set; }  // Setting of the page verify option
        public string PageVerifyOptionDesc { get; set; }  // Description of the page verify option
        public bool IsAutoCreateStatsOn { get; set; }  // Indicates if auto-create statistics is enabled
        public bool IsAutoCreateStatsIncrementalOn { get; set; }  // Indicates if auto-create stats are incremental
        public bool IsAutoUpdateStatsOn { get; set; }  // Indicates if auto-update statistics is enabled
        public bool IsAutoUpdateStatsAsyncOn { get; set; }  // Indicates if async auto-update statistics is enabled
        public bool IsAnsiNullDefaultOn { get; set; }  // Indicates if ANSI NULL default is on
        public bool IsAnsiNullsOn { get; set; }  // Indicates if ANSI NULLs is on
        public bool IsAnsiPaddingOn { get; set; }  // Indicates if ANSI padding is on
        public bool IsAnsiWarningsOn { get; set; }  // Indicates if ANSI warnings are on
        public bool IsArithAbortOn { get; set; }  // Indicates if ARITHABORT is on
        public bool IsConcatNullYieldsNullOn { get; set; }  // Indicates if CONCAT NULL yields NULL
        public bool IsNumericRoundAbortOn { get; set; }  // Indicates if NUMERIC_ROUNDABORT is on
        public bool IsQuotedIdentifierOn { get; set; }  // Indicates if quoted identifier is on
        public bool IsRecursiveTriggersOn { get; set; }  // Indicates if recursive triggers are allowed
        public bool IsCursorCloseOnCommitOn { get; set; }  // Indicates if cursor close on commit is enabled
        public bool IsLocalCursorDefault { get; set; }  // Indicates if cursor default is local
        public bool IsFulltextEnabled { get; set; }  // Indicates if full-text is enabled
        public bool IsTrustworthyOn { get; set; }  // Indicates if the database is trustworthy
        public bool IsDbChainingOn { get; set; }  // Indicates if cross-database ownership chaining is on
        public bool IsParameterizationForced { get; set; }  // Indicates if parameterization is forced
        public bool IsMasterKeyEncryptedByServer { get; set; }  // Indicates if master key is encrypted by server
        public bool IsQueryStoreOn { get; set; }  // Indicates if query store is enabled
        public bool IsPublished { get; set; }  // Indicates if the database is a publication database
        public bool IsMergePublished { get; set; }  // Indicates if the database is merge published
        public bool IsDistributor { get; set; }  // Indicates if the database is a distributor
        public bool IsSyncWithBackup { get; set; }  // Indicates if the database is synchronized with backup
        public Guid ServiceBrokerGuid { get; set; }  // Service broker GUID for the database
        public bool IsBrokerEnabled { get; set; }  // Indicates if the service broker is enabled
        public byte LogReuseWait { get; set; }  // Indicates the transaction log reuse wait type
        public string LogReuseWaitDesc { get; set; }  // Description of the log reuse wait
        public bool IsDateCorrelationOn { get; set; }  // Indicates if date correlation optimization is on
        public bool IsCdcEnabled { get; set; }  // Indicates if change data capture is enabled
        public bool IsEncrypted { get; set; }  // Indicates if the database is encrypted
        public bool IsHonorBrokerPriorityOn { get; set; }  // Indicates if the database honors broker priority
        public Guid ReplicaId { get; set; }  // ID of the local Always On availability replica
        public Guid GroupDatabaseId { get; set; }  // ID of the database within an Always On availability group
        public int ResourcePoolId { get; set; }  // ID of the resource pool mapped to this database
        public int DefaultLanguageLcid { get; set; }  // LCID of the default language of a contained database
        public string DefaultLanguageName { get; set; }  // Default language of the contained database
        public int DefaultFulltextLanguageLcid { get; set; }  // LCID of the default fulltext language of the contained database
        public string DefaultFulltextLanguageName { get; set; }  // Default fulltext language of the contained database
        public bool IsNestedTriggersOn { get; set; }  // Indicates if nested triggers are allowed
        public bool IsTransformNoiseWordsOn { get; set; }  // Indicates if noise words are transformed
        public int TwoDigitYearCutoff { get; set; }  // Cutoff year for interpreting two-digit years
        public byte Containment { get; set; }  // Containment status of the database
        public string ContainmentDesc { get; set; }  // Description of containment status
        public int? TargetRecoveryTimeInSeconds { get; set; }  // Estimated recovery time in seconds
        public byte DelayedDurability { get; set; }  // Delayed durability setting
        public string DelayedDurabilityDesc { get; set; }  // Description of delayed durability setting
        public bool IsMemoryOptimizedElevateToSnapshotOn { get; set; }  // Indicates if memory-optimized tables elevate to snapshot
        public bool IsFederationMember { get; set; }  // Indicates if the database is a member of a federation
        public bool IsRemoteDataArchiveEnabled { get; set; }  // Indicates if the database is stretched
        public bool IsMixedPageAllocationOn { get; set; }  // Indicates if mixed page allocation is on
        public bool IsTemporalHistoryRetentionEnabled { get; set; }  // Indicates if temporal history retention is enabled
        public int CatalogCollationType { get; set; }  // Catalog collation setting
        public string CatalogCollationTypeDesc { get; set; }  // Description of catalog collation setting
        public string PhysicalDatabaseName { get; set; }  // Physical name of the database or unique identifier
        public bool IsResultSetCachingOn { get; set; }  // Indicates if result set caching is enabled
        public bool IsAcceleratedDatabaseRecoveryOn { get; set; }  // Indicates if accelerated database recovery is enabled
        public List<TableModel> GetTableModels() { return tableModels; }

        public void InsertTableModels(List<TableModel> models)
        {
            tableModels = models;
        }
    }
}
