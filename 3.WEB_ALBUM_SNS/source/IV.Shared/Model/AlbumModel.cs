using System.ComponentModel.DataAnnotations;

namespace IV.Shared.Model
{
    /// <summary>
    /// 앨범 정보를 나타내는 모델 클래스
    /// </summary>
    public class AlbumModel
    {
        /// <summary>
        /// 앨범 고유번호 (Primary Key).
        /// </summary>
        [Key]
        public int AlbumId { get; set; }

        /// <summary>
        /// 사용자 고유번호 (Foreign Key).
        /// </summary>
        [Required]
        public int UserId { get; set; }

        /// <summary>
        /// 앨범 제목.
        /// </summary>
        [Required(ErrorMessage = "앨범 제목은 필수입니다.")]
        [StringLength(200, ErrorMessage = "앨범 제목은 200자를 초과할 수 없습니다.")]
        public string AlbumTitle { get; set; } = string.Empty;

        /// <summary>
        /// 앨범 소개.
        /// </summary>
        [Required(ErrorMessage = "앨범 소개는 필수입니다.")]
        public string AlbumDescription { get; set; } = string.Empty;

        /// <summary>
        /// 앨범 생성 일시.
        /// </summary>
        [Required]
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// 해당 앨범의 비공개 여부.
        /// </summary>
        public bool IsPrivate { get; set; }

        /// <summary>
        /// 해당 앨범의 판매 여부.
        /// </summary>
        public bool IsPaid { get; set; }
        
        /// <summary>
        /// 해당 앨범의 가격.
        /// </summary>
        public decimal Price { get; set; }
        
        /// <summary>
        /// 해당 결제 플랜.
        /// </summary>
        public string PlanType { get; set; }
    }
}