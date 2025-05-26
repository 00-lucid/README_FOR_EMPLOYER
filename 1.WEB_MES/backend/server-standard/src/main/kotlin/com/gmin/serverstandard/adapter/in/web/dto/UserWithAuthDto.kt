package com.gmin.serverstandard.adapter.`in`.web.dto

import com.gmin.serverstandard.application.domain.model.User
import java.time.LocalDateTime

/**
 * 사용자 정보와 인증 토큰을 함께 클라이언트에 전달하기 위한 DTO 클래스
 *
 * 사용자 정보와 인증 토큰 정보를 모두 포함합니다.
 */
data class UserWithAuthDto(
    // 사용자 정보
    val companyId: Int,
    val userId: Int,
    val username: String,
    val email: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    
    // 인증 토큰 정보
    val accessToken: String,
    val refreshToken: String,
    val accessTokenExpiresIn: Long,
    val refreshTokenExpiresIn: Long
) {
    companion object {
        /**
         * 도메인 엔티티인 User와 AuthTokenDto를 UserWithAuthDto로 변환합니다.
         *
         * @param user 변환할 도메인 엔티티
         * @param authTokenDto 인증 토큰 정보
         * @return 생성된 UserWithAuthDto 객체
         */
        fun fromDomainAndToken(user: User, authTokenDto: AuthTokenDto): UserWithAuthDto {
            return UserWithAuthDto(
                companyId = user.companyId,
                userId = user.userId,
                username = user.username,
                email = user.email,
                createdAt = user.createdAt,
                updatedAt = user.updatedAt,
                accessToken = authTokenDto.accessToken,
                refreshToken = authTokenDto.refreshToken,
                accessTokenExpiresIn = authTokenDto.accessTokenExpiresIn,
                refreshTokenExpiresIn = authTokenDto.refreshTokenExpiresIn
            )
        }
    }
}