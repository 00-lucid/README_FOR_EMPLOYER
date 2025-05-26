namespace IV.Shared.Model
{
    /// <summary>
    /// Feed 테이블과 매핑되는 모델 클래스
    /// </summary>
    public class FeedModel
    {
        /// <summary>
        /// 피드 PK (자동 증가)
        /// </summary>
        public int FeedId { get; set; }

        /// <summary>
        /// 피드를 생성한 사용자 ID
        /// </summary>
        public int CreatorUserId { get; set; }

        /// <summary>
        /// 피드가 생성된 시간
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// 좋아요 수
        /// </summary>
        public int LikeCount { get; set; }

        /// <summary>
        /// 댓글 수
        /// </summary>
        public int CommentCount { get; set; }

        /// <summary>
        /// 연결된 앨범 ID
        /// </summary>
        public int AlbumId { get; set; }
        
        /// <summary>
        /// 생성자 이름
        /// </summary>
        public string? Username { get; set; }
        
        /// <summary>
        /// 피드 이미지
        /// </summary>
        public string? PhotoUrl { get; set; }
        
        /// <summary>
        /// 좋아요 여부
        /// </summary>
        public bool IsLiked { get; set; }
        
        /// <summary>
        /// 댓글 개수
        /// </summary>
        public int CountComment { get; set; }
        
        public List<string> PhotoUrls { get; set; } = new();
        public List<string> ShortUrls { get; set; } = new();
        
        public List<FeedMedia> Medias { get; set; } = new();
        
        public int CurrentMediaIndex { get; set; } = 0;
        
        public string Body { get; set; } = "";
        
        public string CreatorUserProfileImage { get; set; } = "https://ivblobstorage.blob.core.windows.net/images/default-profile.png";
    }
}