package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.adapter.`in`.web.dto.AuthTokenDto
import com.gmin.serverstandard.adapter.`in`.web.dto.UserDto
import com.gmin.serverstandard.application.domain.model.User
import com.gmin.serverstandard.application.port.`in`.GetUserUseCase
import com.gmin.serverstandard.application.port.`in`.command.LoginCommand
import com.gmin.serverstandard.application.port.`in`.command.SignupCommand
import com.gmin.serverstandard.application.port.out.AuthTokenPort
import com.gmin.serverstandard.application.port.out.LoadUserPort
import com.gmin.serverstandard.application.port.out.SaveUserPort
import com.gmin.serverstandard.common.UseCase
import com.gmin.serverstandard.common.validation.BcryptEncoder
import org.springframework.security.authentication.ott.InvalidOneTimeTokenException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@UseCase
@Service
@Transactional
class GetUserService(
    private val loadUserPort: LoadUserPort,
    private val saveUserPort: SaveUserPort,
    private val tokenPort: AuthTokenPort,
    private val passwordEncoder: BcryptEncoder
): GetUserUseCase {
    override fun login(command: LoginCommand): Result<AuthTokenDto> {
        val userOptional = loadUserPort.findByEmail(command.loginId)

        if (userOptional.isEmpty) {
            return Result.failure(NoSuchElementException("계정을 찾을 수 없습니다: ${command.loginId}"))
        }

        val user = userOptional.get()

        val passwordMatches = passwordEncoder.matches(command.password, user.getHashedPassword())
        return if (passwordMatches) {
            try {
                // 토큰 포트를 통해 JWT 토큰 생성 (이제 액세스 토큰과 리프레시 토큰 모두 생성)
                val token = tokenPort.generateAuthToken(user)
                // 토큰 정보만 반환
                Result.success(token)
            } catch (e: Exception) {
                Result.failure(e)
            }
        } else {
            Result.failure(IllegalArgumentException("비밀번호가 일치하지 않습니다"))
        }
    }

    override fun refreshToken(refreshToken: String): Result<AuthTokenDto> {
        return try {
            // 리프레시 토큰 검증
            if (!tokenPort.validateToken(refreshToken)) {
                return Result.failure(InvalidOneTimeTokenException("유효하지 않은 리프레시 토큰입니다."))
            }

            // 리프레시 토큰이 블랙리스트에 있는지 확인
            if (tokenPort.isTokenBlacklisted(refreshToken)) {
                return Result.failure(InvalidOneTimeTokenException("이미 사용된 리프레시 토큰입니다."))
            }

            // 새 토큰 발급
            val newTokens = tokenPort.refreshAccessToken(refreshToken)

            // 기존 리프레시 토큰 무효화 (재사용 방지)
            tokenPort.invalidateToken(refreshToken)

            newTokens
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun signup(command: SignupCommand): Result<AuthTokenDto> {
        try {
            // 사용자 이름 중복 확인
            val existingUserByUsername = loadUserPort.findByUsername(command.username)
            if (existingUserByUsername.isPresent) {
                return Result.failure(IllegalArgumentException("이미 사용 중인 사용자 이름입니다: ${command.username}"))
            }

            // 이메일 중복 확인
            val existingUserByEmail = loadUserPort.findByEmail(command.email)
            if (existingUserByEmail.isPresent) {
                return Result.failure(IllegalArgumentException("이미 사용 중인 이메일입니다: ${command.email}"))
            }

            // 비밀번호 해싱
            val hashedPassword = passwordEncoder.encode(command.password)

            // 현재 시간 설정
            val now = LocalDateTime.now()

            // 새 사용자 생성
            val newUser = User(
                companyId = command.companyId,
                userId = 0, // 저장 시 자동 생성됨
                username = command.username,
                email = command.email,
                passwordHash = hashedPassword,
                createdAt = now,
                updatedAt = now
            )

            // 사용자 저장
            val savedUser = saveUserPort.saveUser(newUser)

            // 인증 토큰 생성
            val token = tokenPort.generateAuthToken(savedUser)
            return Result.success(token)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }

    override fun getUserById(userId: Int): Result<UserDto> {
        return try {
            val userOptional = loadUserPort.findByUserId(userId)

            if (userOptional.isEmpty) {
                Result.failure(NoSuchElementException("사용자를 찾을 수 없습니다: ID $userId"))
            } else {
                val user = userOptional.get()
                Result.success(UserDto.fromDomain(user))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

}
