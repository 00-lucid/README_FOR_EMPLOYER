using MESALL.Shared.Enums;

namespace MESALL.Shared.Models;

// 거래처 모델 클래스
public class Correspondent
{
    public int CorrespondentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public CorrespondentType Type { get; set; }
    public string Ceo { get; set; } = string.Empty;
    public string BusinessNumber { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string DetailAddress { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string CorrespondentPhotoUri { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// 거래처 생성 요청 모델
public class CreateCorrespondentRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Ceo { get; set; } = string.Empty;
    public string BusinessNumber { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string DetailAddress { get; set; } = string.Empty;
    public string Note { get; set; } = string.Empty;
    public string CorrespondentPhotoUri { get; set; } = string.Empty;
}

// 거래처 수정 요청 모델
public class UpdateCorrespondentRequest : CreateCorrespondentRequest
{
}