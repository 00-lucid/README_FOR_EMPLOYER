using System.ComponentModel.DataAnnotations;

namespace IV.Shared.Model
{
    /// <summary>
    /// 앨범 숏(짧은 영상/콘텐츠)에 대한 정보를 나타내는 모델 클래스
    /// </summary>
    public class AlbumShortModel
    {
        /// <summary>
        /// 앨범 숏 고유번호 (Primary Key).
        /// </summary>
        [Key]
        public int ShortId { get; set; }

        /// <summary>
        /// 앨범 고유번호 (Foreign Key).
        /// </summary>
        [Required]
        public int AlbumId { get; set; }

        /// <summary>
        /// 영상 URL.
        /// </summary>
        [StringLength(500)]
        public string? VideoUrl { get; set; }

        /// <summary>
        /// 썸네일 이미지 URL.
        /// </summary>
        [StringLength(500)]
        public string? ThumbnailUrl { get; set; }

        /// <summary>
        /// 생성 일시.
        /// </summary>
        [Required]
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// 업데이트 일시.
        /// </summary>
        [Required]
        public DateTime UpdatedAt { get; set; }
    }
}