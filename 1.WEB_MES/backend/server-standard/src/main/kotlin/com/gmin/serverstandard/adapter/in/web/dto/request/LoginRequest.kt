package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.LoginCommand

/**
 * 로그인 요청 DTO
 */
@io.swagger.v3.oas.annotations.media.Schema(description = "로그인 요청 정보")
data class LoginRequest(
    @io.swagger.v3.oas.annotations.media.Schema(description = "로그인 이메일", example = "user@example.com")
    val loginId: String,

    @io.swagger.v3.oas.annotations.media.Schema(description = "비밀번호", example = "password123")
    val password: String
){
    /**
     * LoginRequest를 LoginCommand로 변환하는 확장 함수
     */
    fun toCommand(): LoginCommand {
        return LoginCommand(
            loginId = this.loginId,
            password = this.password
        )
    }
}
