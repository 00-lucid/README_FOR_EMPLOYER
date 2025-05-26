using System.ComponentModel.DataAnnotations;

namespace IV.Shared.Model;

/// <summary>
/// 앨범 사진 정보를 나타내는 모델 클래스
/// </summary>
public class AlbumPhotoModel
{
    /// <summary>
    /// 사진 고유번호 (Primary Key).
    /// </summary>
    [Key]
    public int AlbumPhotoId { get; set; }

    /// <summary>
    /// 앨범 고유번호 (Foreign Key).
    /// </summary>
    [Required]
    public int AlbumId { get; set; }

    /// <summary>
    /// 사진 경로.
    /// </summary>
    [Required(ErrorMessage = "사진 경로는 필수입니다.")]
    public string PhotoUrl { get; set; } = string.Empty;

    /// <summary>
    /// 사진 생성 일시.
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }
}