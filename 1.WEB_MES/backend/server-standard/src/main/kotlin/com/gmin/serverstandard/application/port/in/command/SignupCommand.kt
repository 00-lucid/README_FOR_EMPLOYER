package com.gmin.serverstandard.application.port.`in`.command

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

/**
 * 회원가입 요청 커맨드
 * 회원가입에 필요한 정보를 포함
 */
data class SignupCommand(
    @field:NotNull
    val companyId: Int,

    @field:NotBlank
    val username: String,

    @field:NotBlank
    @field:Email
    val email: String,

    @field:NotBlank
    val password: String
)