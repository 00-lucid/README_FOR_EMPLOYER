using System.ComponentModel.DataAnnotations;

namespace IV.Shared.Model;

/// <summary>
/// 앨범 스토리 정보를 나타내는 모델 클래스
/// </summary>
public class AlbumStoryModel
{
    /// <summary>
    /// 스토리 고유번호 (Primary Key).
    /// </summary>
    [Key]
    public int AlbumStoryId { get; set; }

    /// <summary>
    /// 앨범 고유번호 (Foreign Key).
    /// </summary>
    [Required]
    public int AlbumId { get; set; }

    /// <summary>
    /// 스토리 미디어 경로.
    /// </summary>
    [Required(ErrorMessage = "미디어 경로는 필수입니다.")]
    public string MediaUrl { get; set; } = string.Empty;

    /// <summary>
    /// 스토리 생성 일시.
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// 스토리 제거 일시.
    /// </summary>
    [Required]
    public DateTime ExpiresAt { get; set; }
}