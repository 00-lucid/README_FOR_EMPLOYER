namespace SchemaLens.Client.Model
{
    public class TableModel
    {
        public List<ColumnModel> columnModels { get; set; } = [];

        public string Name { get; set; }  // 테이블 이름
        public int ObjectId { get; set; }  // Object ID
        public int? PrincipalId { get; set; }  // 소유자 Principal ID
        public int SchemaId { get; set; }  // 스키마 ID
        public int ParentObjectId { get; set; }  // 부모 Object ID
        public string Type { get; set; }  // 테이블 유형 (약어, 예: U)
        public string TypeDesc { get; set; }  // 테이블 유형 설명 (예: USER_TABLE)
        public DateTime CreateDate { get; set; }  // 생성 날짜
        public DateTime ModifyDate { get; set; }  // 수정 날짜
        public bool IsMsShipped { get; set; }  // 시스템 테이블 여부
        public bool IsPublished { get; set; }  // 게시된 테이블 여부
        public bool IsSchemaPublished { get; set; }  // 스키마 게시 여부
        public int? LobDataSpaceId { get; set; }  // LOB 데이터 공간 ID
        public int? FilestreamDataSpaceId { get; set; }  // FILESTREAM 데이터 공간 ID
        public int MaxColumnIdUsed { get; set; }  // 사용된 최대 열 ID
        public bool LockOnBulkLoad { get; set; }  // 대량 로드 중 잠금 여부
        public bool UsesAnsiNulls { get; set; }  // ANSI NULL 사용 여부
        public bool IsReplicated { get; set; }  // 복제 여부
        public bool HasReplicationFilter { get; set; }  // 복제 필터 포함 여부
        public bool IsMergePublished { get; set; }  // 병합 게시 여부
        public bool IsSyncTranSubscribed { get; set; }  // 동기 트랜잭션 구독 여부
        public bool HasUncheckedAssemblyData { get; set; }  // 확인되지 않은 어셈블리 데이터 포함 여부
        public int? TextInRowLimit { get; set; }  // 행 내 텍스트 제한 값
        public bool LargeValueTypesOutOfRow { get; set; }  // 행 외부에서 큰 값 유형 사용 여부
        public bool IsTrackedByCdc { get; set; }  // CDC 추적 여부
        public byte LockEscalation { get; set; }  // 잠금 확장 유형
        public string LockEscalationDesc { get; set; }  // 잠금 확장 설명
        public bool IsFiletable { get; set; }  // FILETABLE 여부
        public bool IsMemoryOptimized { get; set; }  // 메모리 최적화 여부
        public byte Durability { get; set; }  // 내구성 설정
        public string DurabilityDesc { get; set; }  // 내구성 설명
        public byte TemporalType { get; set; }  // Temporal 테이블 유형
        public string TemporalTypeDesc { get; set; }  // Temporal 테이블 설명
        public int? HistoryTableId { get; set; }  // 히스토리 테이블 ID
        public bool IsRemoteDataArchiveEnabled { get; set; }  // 원격 데이터 아카이브 사용 여부
        public bool IsExternal { get; set; }  // 외부 테이블 여부
        public int? HistoryRetentionPeriod { get; set; }  // 히스토리 보존 기간
        public int? HistoryRetentionPeriodUnit { get; set; }  // 히스토리 보존 기간 단위
        public string HistoryRetentionPeriodUnitDesc { get; set; }  // 히스토리 보존 기간 단위 설명
        public bool IsNode { get; set; }  // 그래프 노드 여부
        public bool IsEdge { get; set; }  // 그래프 엣지 여부
        public List<ColumnModel> GetColumnModels() { return columnModels; }

        public void InsertColumnModels(List<ColumnModel> models)
        {
            columnModels = models;
        }
    }
}