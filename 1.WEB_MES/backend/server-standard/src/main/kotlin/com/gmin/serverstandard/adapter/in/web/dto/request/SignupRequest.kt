package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.SignupCommand
import io.swagger.v3.oas.annotations.media.Schema

/**
 * 회원가입 요청 DTO
 */
@Schema(description = "회원가입 요청 정보")
data class SignupRequest(
    @Schema(description = "회사 ID", example = "1")
    val companyId: Int,

    @Schema(description = "사용자 이름", example = "홍길동")
    val username: String,

    @Schema(description = "이메일", example = "user@example.com")
    val email: String,

    @Schema(description = "비밀번호", example = "password123")
    val password: String
) {
    /**
     * SignupRequest를 SignupCommand로 변환하는 확장 함수
     */
    fun toCommand(): SignupCommand {
        return SignupCommand(
            companyId = this.companyId,
            username = this.username,
            email = this.email,
            password = this.password
        )
    }
}