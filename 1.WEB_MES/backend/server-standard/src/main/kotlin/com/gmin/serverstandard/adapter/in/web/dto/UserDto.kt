package com.gmin.serverstandard.adapter.`in`.web.dto

import com.gmin.serverstandard.application.domain.model.User
import java.time.LocalDateTime

/**
 * 사용자 정보를 클라이언트에 전달하기 위한 DTO 클래스
 *
 * 민감한 정보(비밀번호 해시 등)를 제외하고
 * 클라이언트에 필요한 사용자 정보만 포함합니다.
 */
data class UserDto(
    val companyId: Int,
    val userId: Int,
    val username: String,
    val email: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val positionId: Int,
    val employmentStatus: String,
    val phoneNumber: String?
) {
    companion object {
        /**
         * 도메인 엔티티인 User를 UserDto로 변환합니다.
         *
         * @param user 변환할 도메인 엔티티
         * @return 생성된 UserDto 객체
         */
        fun fromDomain(user: User): UserDto {
            return UserDto(
                companyId = user.companyId,
                userId = user.userId,
                username = user.username,
                email = user.email,
                createdAt = user.createdAt,
                updatedAt = user.updatedAt,
                positionId = user.positionId,
                employmentStatus = user.employmentStatus,
                phoneNumber = user.phoneNumber
            )
        }
    }
}
