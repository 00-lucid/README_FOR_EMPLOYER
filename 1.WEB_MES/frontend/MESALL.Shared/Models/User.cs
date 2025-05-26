using System.ComponentModel.DataAnnotations;

namespace MESALL.Shared.Models;

public class User
{
    /// <summary>
    /// 사용자의 고유 ID (Primary Key).
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// 사용자 이름 (Username). 고유 값이어야 하며 필수 입력 사항.
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// 사용자 이메일. 고유 값이어야 하며 필수 입력 사항.
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// 사용자가 생성된 날짜 및 시간.
    /// </summary>
    public DateTime CreatedAt { get; set; }
    
    /// <summary>
    /// 업데이트 시간.
    /// </summary>
    public DateTime UpdatedAt { get; set; }
    
    /// <summary>
    /// 사용자 소속 회사 코드.
    /// </summary>
    public int CompanyId { get; set; }
    
    /// <summary>
    /// 사용자의 직급 코드.
    /// </summary>
    public int PositionId { get; set; }
    
    /// <summary>
    /// 사용자의 재직 상태.
    /// </summary>
    public string EmploymentStatus { get; set; }
    
    /// <summary>
    /// 사용자의 연락처.
    /// </summary>
    public string PhoneNumber { get; set; }
}
