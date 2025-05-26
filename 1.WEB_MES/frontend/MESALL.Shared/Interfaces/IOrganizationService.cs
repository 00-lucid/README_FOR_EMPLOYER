using MESALL.Shared.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace MESALL.Shared.Interfaces
{
    public interface IOrganizationService
    {
        // 모든 조직 가져오기
        Task<List<Organization>> GetAllOrganizationsAsync();
        
        // ID로 특정 조직 가져오기
        Task<Organization> GetOrganizationByIdAsync(int organizationId);
        
        // 회사 ID로 조직 목록 가져오기
        Task<List<Organization>> GetOrganizationsByCompanyIdAsync(int companyId);
        
        // 사용자 ID로 조직 목록 가져오기
        Task<List<Organization>> GetOrganizationsByUserIdAsync(int userId);
        
        // 조직 생성하기
        Task<Organization> CreateOrganizationAsync(CreateOrganizationRequest request);
        
        // 조직 업데이트하기
        Task<Organization> UpdateOrganizationAsync(int organizationId, UpdateOrganizationRequest request);
        
        // 조직 삭제하기
        Task<bool> DeleteOrganizationAsync(int organizationId);
        
        // 조직에 사용자 추가하기
        Task<bool> AddUserToOrganizationAsync(int organizationId, int userId);
        
        // 조직에서 사용자 제거하기
        Task<bool> RemoveUserFromOrganizationAsync(int organizationId, int userId);
        
        // 루트 조직 목록 가져오기 (부모가 없는 조직)
        Task<List<Organization>> GetRootOrganizationsAsync();
        
        // 특정 부모 조직의 하위 조직 목록 가져오기
        Task<List<Organization>> GetChildOrganizationsAsync(int parentOrganizationId);
        
        // 계층 구조로 조직 트리 구성하기
        Task<List<Organization>> BuildOrganizationTreeAsync(List<Organization> organizations);
    }
}