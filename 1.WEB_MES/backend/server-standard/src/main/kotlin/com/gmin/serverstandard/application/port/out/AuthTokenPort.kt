package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.adapter.`in`.web.dto.AuthTokenDto
import com.gmin.serverstandard.application.domain.model.User
import java.security.Key

interface AuthTokenPort {
    fun generateAuthToken(user: User): AuthTokenDto
    fun validateToken(token: String): Boolean
    fun refreshAccessToken(refreshToken: String): Result<AuthTokenDto>
    fun getSigningKey(): Key
    fun getUserIdFromToken(token: String): Int?
    // 토큰 유효성 무력화 및 체크 함수
    fun invalidateToken(token: String)
    fun isTokenBlacklisted(token: String): Boolean
}