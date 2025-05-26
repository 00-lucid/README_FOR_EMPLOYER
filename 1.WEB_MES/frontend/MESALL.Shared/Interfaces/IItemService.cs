using MESALL.Shared.Models;
using MESALL.Shared.Response;

namespace MESALL.Shared.Interfaces;

public interface IItemService
{
    // 모든 품목 조회
    Task<List<Item>?> GetAllItemsAsync();
    
    // 품목 상세 조회
    Task<Item?> GetItemByIdAsync(int itemId);
    
    // 회사별 품목 조회
    Task<List<Item>?> GetItemsByCompanyIdAsync(int companyId);
    
    // 품목 타입별 조회
    Task<List<Item>?> GetItemsByTypeAsync(string itemType);
    
    // 품목 생성
    Task<Item?> CreateItemAsync(CreateItemRequest request);
    
    // 품목 수정
    Task<Item?> UpdateItemAsync(int itemId, UpdateItemRequest request);
    
    // 품목 삭제
    Task<bool> DeleteItemAsync(int itemId);
}