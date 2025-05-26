package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.port.`in`.DeleteOrganizationUseCase
import com.gmin.serverstandard.application.port.out.DeleteOrganizationPort
import com.gmin.serverstandard.application.port.out.LoadOrganizationPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@UseCase
@Service
@Transactional
class DeleteOrganizationService(
    private val loadOrganizationPort: LoadOrganizationPort,
    private val deleteOrganizationPort: DeleteOrganizationPort
) : DeleteOrganizationUseCase {
    
    override fun deleteOrganization(organizationId: Int): Result<Boolean> {
        return try {
            // 조직이 존재하는지 확인
            val organizationOptional = loadOrganizationPort.findById(organizationId)
            if (organizationOptional.isEmpty) {
                return Result.failure(NoSuchElementException("조직을 찾을 수 없습니다: ID $organizationId"))
            }
            
            // 조직 삭제
            val success = deleteOrganizationPort.deleteById(organizationId)
            if (!success) {
                return Result.failure(IllegalStateException("조직 삭제에 실패했습니다"))
            }
            
            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}