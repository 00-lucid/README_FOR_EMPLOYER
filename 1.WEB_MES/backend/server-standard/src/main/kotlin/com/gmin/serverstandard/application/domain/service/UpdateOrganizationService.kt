package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Organization
import com.gmin.serverstandard.application.port.`in`.UpdateOrganizationUseCase
import com.gmin.serverstandard.application.port.`in`.command.UpdateOrganizationCommand
import com.gmin.serverstandard.application.port.out.LoadOrganizationPort
import com.gmin.serverstandard.application.port.out.SaveOrganizationPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@UseCase
@Service
@Transactional
class UpdateOrganizationService(
    private val loadOrganizationPort: LoadOrganizationPort,
    private val saveOrganizationPort: SaveOrganizationPort
) : UpdateOrganizationUseCase {

    override fun updateOrganization(command: UpdateOrganizationCommand): Result<Organization> {
        return try {
            // 기존 조직 조회
            val existingOrganizationOptional = loadOrganizationPort.findById(command.organizationId)

            if (existingOrganizationOptional.isEmpty) {
                return Result.failure(NoSuchElementException("조직을 찾을 수 없습니다: ID ${command.organizationId}"))
            }

            val existingOrganization = existingOrganizationOptional.get()

            // 업데이트된 조직 생성
            val updatedOrganization = Organization(
                organizationId = existingOrganization.organizationId,
                organizationName = command.organizationName,
                companyId = command.companyId,
                createdAt = existingOrganization.createdAt,
                updatedAt = LocalDateTime.now(),
                parentOrganizationId = command.parentOrganizationId,
                users = existingOrganization.users
            )

            // 조직 저장
            val savedOrganization = saveOrganizationPort.save(updatedOrganization)

            Result.success(savedOrganization)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun removeUserFromOrganization(organizationId: Int, userId: Int): Result<Boolean> {
        return try {
            // 조직이 존재하는지 확인
            val organizationOptional = loadOrganizationPort.findById(organizationId)
            if (organizationOptional.isEmpty) {
                return Result.failure(NoSuchElementException("조직을 찾을 수 없습니다: ID $organizationId"))
            }

            // 사용자를 조직에서 제거
            val success = saveOrganizationPort.removeUserFromOrganization(organizationId, userId)
            if (!success) {
                return Result.failure(IllegalStateException("사용자를 조직에서 제거하는데 실패했습니다"))
            }

            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
