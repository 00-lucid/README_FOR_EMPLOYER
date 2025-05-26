package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.adapter.`in`.web.dto.UserDto
import com.gmin.serverstandard.application.domain.model.User
import com.gmin.serverstandard.application.port.`in`.UpdateUserUseCase
import com.gmin.serverstandard.application.port.`in`.command.UpdateUserCommand
import com.gmin.serverstandard.application.port.out.LoadUserPort
import com.gmin.serverstandard.application.port.out.SaveUserPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@UseCase
@Service
@Transactional
class UpdateUserService(
    private val loadUserPort: LoadUserPort,
    private val saveUserPort: SaveUserPort
) : UpdateUserUseCase {
    override fun updateUser(command: UpdateUserCommand): Result<UserDto> {
        return try {
            val userOptional = loadUserPort.findByUserId(command.userId)

            if (userOptional.isEmpty) {
                return Result.failure(NoSuchElementException("사용자를 찾을 수 없습니다: ID ${command.userId}"))
            }

            val existingUser = userOptional.get()

            // 이메일 변경 시 중복 확인
            if (command.email != null && command.email != existingUser.email) {
                val existingUserByEmail = loadUserPort.findByEmail(command.email)
                if (existingUserByEmail.isPresent) {
                    return Result.failure(IllegalArgumentException("이미 사용 중인 이메일입니다: ${command.email}"))
                }
            }

            // 사용자 이름 변경 시 중복 확인
            if (command.username != null && command.username != existingUser.username) {
                val existingUserByUsername = loadUserPort.findByUsername(command.username)
                if (existingUserByUsername.isPresent) {
                    return Result.failure(IllegalArgumentException("이미 사용 중인 사용자 이름입니다: ${command.username}"))
                }
            }

            // 업데이트할 사용자 정보 생성
            val updatedUser = User(
                userId = existingUser.userId,
                companyId = existingUser.companyId,
                username = command.username ?: existingUser.username,
                email = command.email ?: existingUser.email,
                passwordHash = existingUser.passwordHash,
                createdAt = existingUser.createdAt,
                updatedAt = LocalDateTime.now(),
                positionId = command.positionId ?: existingUser.positionId,
                employmentStatus = command.employmentStatus ?: existingUser.employmentStatus,
                phoneNumber = command.phoneNumber ?: existingUser.phoneNumber
            )

            // 사용자 정보 저장
            val savedUser = saveUserPort.saveUser(updatedUser)
            Result.success(UserDto.fromDomain(savedUser))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}