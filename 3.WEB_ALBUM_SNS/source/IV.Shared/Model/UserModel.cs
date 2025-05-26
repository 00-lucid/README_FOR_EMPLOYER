using System.ComponentModel.DataAnnotations;

namespace IV.Shared.Model;

public class UserModel
{
    /// <summary>
    /// 사용자의 고유 ID (Primary Key).
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// 사용자 이름 (Username). 고유 값이어야 하며 필수 입력 사항.
    /// </summary>
    [Required(ErrorMessage = "Username is required.")]
    [StringLength(50, ErrorMessage = "Username cannot exceed 50 characters.")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// 사용자 이메일. 고유 값이어야 하며 필수 입력 사항.
    /// </summary>
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email format.")]
    [StringLength(100, ErrorMessage = "Email cannot exceed 100 characters.")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// 비밀번호 해시. 평문 비밀번호는 저장하지 않음.
    /// </summary>
    [Required]
    [StringLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// 사용자가 생성된 날짜 및 시간.
    /// </summary>
    [Required]
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// 사용자 프로필 이미지.
    /// </summary>
    [Required]
    public string ProfileImage { get; set; }
    
    /// <summary>
    /// 사용자 배경 이미지.
    /// </summary>
    [Required]
    public string BackgroundImage { get; set; }
    
    /// <summary>
    /// 사용자 유료 재화 보유량.
    /// </summary>
    [Required]
    public int Credit { get; set; }
}
