using MESALL.Shared.Enums;
using MESALL.Shared.Models;

namespace MESALL.Shared.Interfaces;

public interface ICorrespondentService
{
    /// <summary>
    /// 모든 거래처 조회
    /// </summary>
    /// <returns>거래처 목록</returns>
    Task<List<Correspondent>> GetAllCorrespondentsAsync();
    
    /// <summary>
    /// 거래처 상세 조회
    /// </summary>
    /// <param name="correspondentId">조회할 거래처 ID</param>
    /// <returns>거래처 정보</returns>
    Task<Correspondent?> GetCorrespondentByIdAsync(int correspondentId);
    
    /// <summary>
    /// 거래처 타입별 조회
    /// </summary>
    /// <param name="type">조회할 거래처 타입</param>
    /// <returns>거래처 목록</returns>
    Task<List<Correspondent>> GetCorrespondentsByTypeAsync(string? type);
    
    /// <summary>
    /// 거래처 생성
    /// </summary>
    /// <param name="request">생성할 거래처 정보</param>
    /// <returns>생성된 거래처 정보</returns>
    Task<Correspondent?> CreateCorrespondentAsync(CreateCorrespondentRequest request);
    
    /// <summary>
    /// 거래처 수정
    /// </summary>
    /// <param name="correspondentId">수정할 거래처 ID</param>
    /// <param name="request">수정할 거래처 정보</param>
    /// <returns>수정된 거래처 정보</returns>
    Task<Correspondent?> UpdateCorrespondentAsync(int correspondentId, UpdateCorrespondentRequest request);
    
    /// <summary>
    /// 거래처 삭제
    /// </summary>
    /// <param name="correspondentId">삭제할 거래처 ID</param>
    /// <returns>삭제 성공 여부</returns>
    Task<bool> DeleteCorrespondentAsync(int correspondentId);
}