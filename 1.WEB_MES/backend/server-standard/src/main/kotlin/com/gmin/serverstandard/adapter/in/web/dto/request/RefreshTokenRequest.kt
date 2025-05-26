package com.gmin.serverstandard.adapter.`in`.web.dto.request

import io.swagger.v3.oas.annotations.media.Schema

// 토큰 갱신 요청을 위한 DTO 클래스
data class RefreshTokenRequest(
    @Schema(description = "리프레시 토큰", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
    val refreshToken: String
)
