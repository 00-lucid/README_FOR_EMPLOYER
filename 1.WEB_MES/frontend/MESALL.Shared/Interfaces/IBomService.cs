using MESALL.Shared.Enums;
using MESALL.Shared.Models;

namespace MESALL.Shared.Interfaces;

public interface IBomService
{
    /// <summary>
    /// 모든 BOM 목록 조회
    /// </summary>
    /// <returns>BOM 목록</returns>
    Task<List<Bom>> GetAllBomsAsync();
    
    /// <summary>
    /// BOM 상세 조회
    /// </summary>
    /// <param name="bomId">조회할 BOM ID</param>
    /// <returns>BOM 정보</returns>
    Task<Bom?> GetBomByIdAsync(int bomId);
    
    /// <summary>
    /// 상태별 BOM 조회
    /// </summary>
    /// <param name="status">조회할 BOM 상태</param>
    /// <returns>BOM 목록</returns>
    Task<List<Bom>> GetBomsByStatusAsync(string status);
    
    /// <summary>
    /// BOM 품목 목록 조회
    /// </summary>
    /// <param name="bomId">조회할 BOM ID</param>
    /// <returns>BOM 품목 목록</returns>
    Task<List<ItemBom>> GetBomItemsAsync(int bomId);
    
    /// <summary>
    /// BOM 품목 트리 조회
    /// </summary>
    /// <param name="bomId">조회할 BOM ID</param>
    /// <returns>BOM 품목 트리</returns>
    Task<List<ItemBomTree>> GetBomItemTreeAsync(int bomId);
    
    /// <summary>
    /// BOM 생성
    /// </summary>
    /// <param name="request">생성할 BOM 정보</param>
    /// <returns>생성된 BOM 정보</returns>
    Task<Bom?> CreateBomAsync(CreateBomRequest request);
    
    /// <summary>
    /// BOM 수정
    /// </summary>
    /// <param name="bomId">수정할 BOM ID</param>
    /// <param name="request">수정할 BOM 정보</param>
    /// <returns>수정된 BOM 정보</returns>
    Task<Bom?> UpdateBomAsync(int bomId, UpdateBomRequest request);
    
    /// <summary>
    /// BOM 삭제
    /// </summary>
    /// <param name="bomId">삭제할 BOM ID</param>
    /// <returns>삭제 성공 여부</returns>
    Task<bool> DeleteBomAsync(int bomId);
    
    /// <summary>
    /// BOM에 품목 추가
    /// </summary>
    /// <param name="bomId">BOM ID</param>
    /// <param name="request">추가할 품목 정보</param>
    /// <returns>추가 성공 여부</returns>
    Task<bool> AddItemToBomAsync(int bomId, AddItemToBomRequest request);
    
    /// <summary>
    /// BOM 내 품목 수정
    /// </summary>
    /// <param name="bomId">BOM ID</param>
    /// <param name="itemId">수정할 품목 ID</param>
    /// <param name="request">수정할 품목 정보</param>
    /// <returns>수정 성공 여부</returns>
    Task<bool> UpdateBomItemAsync(int bomId, int itemId, UpdateBomItemRequest request);
    
    /// <summary>
    /// BOM에서 품목 제거
    /// </summary>
    /// <param name="bomId">BOM ID</param>
    /// <param name="itemId">제거할 품목 ID</param>
    /// <returns>제거 성공 여부</returns>
    Task<bool> RemoveItemFromBomAsync(int bomId, int itemId);
}