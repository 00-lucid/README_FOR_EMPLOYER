using System.ComponentModel.DataAnnotations;

namespace IV.Shared.Model;

/// <summary>
/// 앨범 구독 정보를 나타내는 모델 클래스
/// </summary>
public class AlbumSubscriptionModel
{
    /// <summary>
    /// 구독 고유 번호 (Primary Key).
    /// </summary>
    [Key]
    public int SubscriptionId { get; set; }

    /// <summary>
    /// 사용자의 고유 번호 (Foreign Key).
    /// </summary>
    [Required]
    public int UserId { get; set; }

    /// <summary>
    /// 앨범 고유 번호 (Foreign Key).
    /// </summary>
    [Required]
    public int AlbumId { get; set; }

    /// <summary>
    /// 구독한 날짜.
    /// </summary>
    [Required]
    public DateTime SubscriptionDate { get; set; } = DateTime.Now;

    /// <summary>
    /// 구독 활성화 여부.
    /// </summary>
    [Required]
    public bool IsActive { get; set; } = true;
}