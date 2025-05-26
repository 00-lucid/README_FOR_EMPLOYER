package com.gmin.serverstandard.application.port.`in`.command

import jakarta.validation.constraints.NotBlank

/**
 * 로그인 요청 커맨드
 * 로그인에 필요한 이메일과 비밀번호만 포함
 */
data class LoginCommand(
    @field:NotBlank
    val loginId: String,

    @field:NotBlank
    val password: String
)
