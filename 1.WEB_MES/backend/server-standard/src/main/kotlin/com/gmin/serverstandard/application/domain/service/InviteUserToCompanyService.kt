package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.adapter.`in`.web.dto.UserDto
import com.gmin.serverstandard.application.domain.model.User
import com.gmin.serverstandard.application.port.`in`.InviteUserToCompanyUseCase
import com.gmin.serverstandard.application.port.`in`.command.InviteUserToCompanyCommand
import com.gmin.serverstandard.application.port.out.LoadUserPort
import com.gmin.serverstandard.application.port.out.SaveUserPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@UseCase
@Service
@Transactional
class InviteUserToCompanyService(
    private val loadUserPort: LoadUserPort,
    private val saveUserPort: SaveUserPort
) : InviteUserToCompanyUseCase {
    override fun inviteUserToCompany(command: InviteUserToCompanyCommand): Result<UserDto> {
        return try {
            // 이메일로 사용자 찾기
            val userOptional = loadUserPort.findByEmail(command.email)

            if (userOptional.isEmpty) {
                return Result.failure(NoSuchElementException("해당 이메일을 가진 사용자를 찾을 수 없습니다: ${command.email}"))
            }

            val existingUser = userOptional.get()

            // 이미 해당 회사에 속해 있는지 확인
            if (existingUser.companyId == command.companyId) {
                return Result.failure(IllegalStateException("사용자가 이미 해당 회사에 속해 있습니다: ${command.email}"))
            }

            // 사용자의 회사 정보 업데이트
            val updatedUser = User(
                userId = existingUser.userId,
                companyId = command.companyId, // 회사 ID 업데이트
                username = existingUser.username,
                email = existingUser.email,
                passwordHash = existingUser.passwordHash,
                createdAt = existingUser.createdAt,
                updatedAt = LocalDateTime.now(),
                positionId = existingUser.positionId,
                employmentStatus = existingUser.employmentStatus,
                phoneNumber = existingUser.phoneNumber
            )

            // 사용자 정보 저장
            val savedUser = saveUserPort.saveUser(updatedUser)
            Result.success(UserDto.fromDomain(savedUser))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}