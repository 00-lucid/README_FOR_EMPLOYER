package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Organization
import com.gmin.serverstandard.application.port.`in`.CreateOrganizationUseCase
import com.gmin.serverstandard.application.port.`in`.command.CreateOrganizationCommand
import com.gmin.serverstandard.application.port.out.LoadOrganizationPort
import com.gmin.serverstandard.application.port.out.LoadUserPort
import com.gmin.serverstandard.application.port.out.SaveOrganizationPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@UseCase
@Service
@Transactional
class CreateOrganizationService(
    private val saveOrganizationPort: SaveOrganizationPort,
    private val loadUserPort: LoadUserPort,
    private val loadOrganizationPort: LoadOrganizationPort
) : CreateOrganizationUseCase {

    override fun createOrganization(command: CreateOrganizationCommand): Result<Organization> {
        return try {
            // 현재 시간 설정
            val now = LocalDateTime.now()

            // 새 조직 생성
            val newOrganization = Organization(
                organizationId = 0, // 저장 시 자동 생성됨
                organizationName = command.organizationName,
                companyId = command.companyId,
                createdAt = now,
                updatedAt = now,
                parentOrganizationId = command.parentOrganizationId,
                users = emptyList() // 초기에는 사용자 없음
            )

            // 조직 저장
            val savedOrganization = saveOrganizationPort.save(newOrganization)

            // 사용자 추가 (있는 경우)
            if (command.userIds.isNotEmpty()) {
                for (userId in command.userIds) {
                    saveOrganizationPort.addUserToOrganization(savedOrganization.organizationId, userId)
                }
            }

            Result.success(savedOrganization)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun addUserToOrganization(organizationId: Int, userId: Int): Result<Boolean> {
        return try {
            // 사용자가 존재하는지 확인
            val userOptional = loadUserPort.findByUserId(userId)
            if (userOptional.isEmpty) {
                return Result.failure(NoSuchElementException("사용자를 찾을 수 없습니다: ID $userId"))
            }

            // 사용자를 조직에 추가
            val success = saveOrganizationPort.addUserToOrganization(organizationId, userId)
            if (!success) {
                return Result.failure(IllegalStateException("사용자를 조직에 추가하는데 실패했습니다"))
            }

            Result.success(true)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
