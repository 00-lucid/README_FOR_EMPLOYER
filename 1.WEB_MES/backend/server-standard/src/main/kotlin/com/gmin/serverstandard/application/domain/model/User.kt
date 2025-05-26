package com.gmin.serverstandard.application.domain.model

import java.time.LocalDateTime

data class User(
    val companyId: Int,
    val userId: Int,
    val username: String,
    val email: String,
    val passwordHash: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val positionId: Int = 1,
    val employmentStatus: String = "재직중",
    val phoneNumber: String? = null
) {
    // 비밀번호 해시 접근자
    fun getHashedPassword(): String {
        return passwordHash
    }
}
