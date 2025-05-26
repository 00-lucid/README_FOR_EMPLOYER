namespace SchemaLens.Client.Model
{
    public class ColumnModel
    {
        // 객체의 ID (테이블 또는 뷰와 관련된 객체의 ID)
        public int ObjectId { get; set; }

        // 컬럼 이름
        public string Name { get; set; } = string.Empty;

        // 컬럼의 고유 ID
        public int ColumnId { get; set; }

        // 시스템 데이터 유형 ID
        public int SystemTypeId { get; set; }

        // 사용자 정의 데이터 유형 ID
        public int UserTypeId { get; set; }

        // 컬럼의 최대 길이 (문자열 데이터 유형에 해당)
        public short MaxLength { get; set; }

        // 숫자 데이터 유형의 정밀도
        public byte Precision { get; set; }

        // 숫자 데이터 유형의 스케일
        public byte Scale { get; set; }

        // 컬럼의 정렬 이름 (Collation)
        public string? CollationName { get; set; }

        // 컬럼이 NULL을 허용하는지 여부
        public bool IsNullable { get; set; }

        // ANSI 패딩이 적용된 컬럼인지 여부
        public bool IsAnsiPadded { get; set; }

        // GUID 값을 자동으로 생성하는 컬럼인지 여부
        public bool IsRowguidcol { get; set; }

        // 컬럼이 IDENTITY 속성인지 여부 (자동 증가 컬럼)
        public bool IsIdentity { get; set; }

        // 컬럼이 계산된 컬럼인지 여부
        public bool IsComputed { get; set; }

        // 컬럼이 FILESTREAM 데이터 유형을 사용하는지 여부
        public bool IsFilestream { get; set; }

        // 컬럼이 복제되는지 여부
        public bool IsReplicated { get; set; }

        // 컬럼이 비 SQL 구독되는지 여부
        public bool IsNonSqlSubscribed { get; set; }

        // 컬럼이 머지 퍼블리시되는지 여부
        public bool IsMergePublished { get; set; }

        // 컬럼이 DTS 복제되는지 여부
        public bool IsDtsReplicated { get; set; }

        // 컬럼이 XML 문서를 포함하는지 여부
        public bool IsXmlDocument { get; set; }

        // XML 컬렉션의 ID
        public int XmlCollectionId { get; set; }

        // 컬럼의 기본값을 정의하는 객체 ID
        public int DefaultObjectId { get; set; }

        // 컬럼에 적용된 규칙 객체 ID
        public int RuleObjectId { get; set; }

        // 컬럼이 희소( Sparse ) 컬럼인지 여부
        public bool IsSparse { get; set; }

        // 컬럼이 컬럼 세트인 경우
        public bool IsColumnSet { get; set; }

        // 컬럼의 항상 생성되는 유형 (Generated Always) 타입
        public byte GeneratedAlwaysType { get; set; }

        // Generated Always 컬럼 유형에 대한 설명
        public string? GeneratedAlwaysTypeDesc { get; set; }

        // 컬럼의 암호화 유형
        public byte EncryptionType { get; set; }

        // 암호화 유형에 대한 설명
        public string? EncryptionTypeDesc { get; set; }

        // 사용된 암호화 알고리즘 이름
        public string? EncryptionAlgorithmName { get; set; }

        // 컬럼 암호화 키 ID (있는 경우)
        public int? ColumnEncryptionKeyId { get; set; }

        // 컬럼 암호화 키 데이터베이스 이름
        public string? ColumnEncryptionKeyDatabaseName { get; set; }

        // 컬럼이 숨겨져 있는지 여부
        public bool IsHidden { get; set; }

        // 컬럼에 마스킹이 적용되어 있는지 여부
        public bool IsMasked { get; set; }

        // 컬럼이 그래프의 일부인지 여부
        public byte GraphType { get; set; }

        // 그래프 유형에 대한 설명
        public string? GraphTypeDesc { get; set; }
    }


}
