package com.gmin.serverstandard.adapter.`in`.web.controller

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.AuthTokenDto
import com.gmin.serverstandard.adapter.`in`.web.dto.UserDto
import com.gmin.serverstandard.adapter.`in`.web.dto.request.InviteUserToCompanyRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.LoginRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.RefreshTokenRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.SignupRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.UpdateUserRequest
import com.gmin.serverstandard.application.port.`in`.GetUserUseCase
import com.gmin.serverstandard.application.port.`in`.GetUsersByCompanyIdUseCase
import com.gmin.serverstandard.application.port.`in`.InviteUserToCompanyUseCase
import com.gmin.serverstandard.application.port.`in`.UpdateUserUseCase
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/user")
@Tag(name = "계정 API", description = "계정 관련 API")
class UserController(
    private val userUseCase: GetUserUseCase,
    private val updateUserUseCase: UpdateUserUseCase,
    private val getUsersByCompanyIdUseCase: GetUsersByCompanyIdUseCase,
    private val inviteUserToCompanyUseCase: InviteUserToCompanyUseCase
) {
    @Operation(
        summary = "로그인 API",
        description = "사용자 로그인을 처리하는 API입니다."
    )
    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): ResponseEntity<ApiResponseDto<AuthTokenDto>> {
        val command = loginRequest.toCommand()

        val result = userUseCase.login(command)

        return if (result.isSuccess) {
            // 로그인 성공 시 토큰 정보만 반환
            val authTokenDto = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "로그인 성공",
                    data = authTokenDto
                )
            )
        } else {
            // 로그인 실패 시 에러 메시지 반환
            ResponseEntity.status(401).body(
                ApiResponseDto(
                    success = false,
                    message = "로그인 실패: ${result.exceptionOrNull()?.message ?: "인증 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "토큰 갱신 API",
        description = "리프레시 토큰을 사용하여 새로운 액세스 토큰을 발급받는 API입니다."
    )
    @PostMapping("/refresh-token")
    fun refreshToken(@RequestBody refreshTokenRequest: RefreshTokenRequest): ResponseEntity<ApiResponseDto<AuthTokenDto>> {
        val result = userUseCase.refreshToken(refreshTokenRequest.refreshToken)

        return if (result.isSuccess) {
            // 토큰 갱신 성공 시 새 토큰 정보를 반환
            val newAuthTokenDto = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "토큰 갱신 성공",
                    data = newAuthTokenDto
                )
            )
        } else {
            // 토큰 갱신 실패 시 에러 메시지 반환
            ResponseEntity.status(401).body(
                ApiResponseDto(
                    success = false,
                    message = "토큰 갱신 실패: ${result.exceptionOrNull()?.message ?: "유효하지 않은 리프레시 토큰"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "회원가입 API",
        description = "새로운 사용자 계정을 생성하는 API입니다."
    )
    @PostMapping("/signup")
    fun signup(@RequestBody signupRequest: SignupRequest): ResponseEntity<ApiResponseDto<AuthTokenDto>> {
        val command = signupRequest.toCommand()

        val result = userUseCase.signup(command)

        return if (result.isSuccess) {
            // 회원가입 성공 시 토큰 정보를 반환
            val authTokenDto = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "회원가입 성공",
                    data = authTokenDto
                )
            )
        } else {
            // 회원가입 실패 시 에러 메시지 반환
            ResponseEntity.status(400).body(
                ApiResponseDto(
                    success = false,
                    message = "회원가입 실패: ${result.exceptionOrNull()?.message ?: "등록 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "사용자 정보 조회 API",
        description = "사용자 ID로 사용자 정보를 조회하는 API입니다."
    )
    @GetMapping("/{userId}")
    fun getUserById(@PathVariable userId: Int): ResponseEntity<ApiResponseDto<UserDto>> {
        val result = userUseCase.getUserById(userId)

        return if (result.isSuccess) {
            // 사용자 정보 조회 성공 시 사용자 정보를 반환
            val userDto = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "사용자 정보 조회 성공",
                    data = userDto
                )
            )
        } else {
            // 사용자 정보 조회 실패 시 에러 메시지 반환
            ResponseEntity.status(404).body(
                ApiResponseDto(
                    success = false,
                    message = "사용자 정보 조회 실패: ${result.exceptionOrNull()?.message ?: "사용자를 찾을 수 없습니다"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "사용자 정보 업데이트 API",
        description = "사용자 정보를 업데이트하는 API입니다."
    )
    @PutMapping("/{userId}")
    fun updateUser(
        @PathVariable userId: Int,
        @RequestBody updateUserRequest: UpdateUserRequest
    ): ResponseEntity<ApiResponseDto<UserDto>> {
        val command = updateUserRequest.toCommand(userId)
        val result = updateUserUseCase.updateUser(command)

        return if (result.isSuccess) {
            // 사용자 정보 업데이트 성공 시 업데이트된 사용자 정보를 반환
            val userDto = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "사용자 정보 업데이트 성공",
                    data = userDto
                )
            )
        } else {
            // 사용자 정보 업데이트 실패 시 에러 메시지 반환
            ResponseEntity.status(400).body(
                ApiResponseDto(
                    success = false,
                    message = "사용자 정보 업데이트 실패: ${result.exceptionOrNull()?.message ?: "업데이트 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "회사별 사용자 목록 조회 API",
        description = "특정 회사에 속한 모든 사용자를 조회하는 API입니다."
    )
    @GetMapping("/company/{companyId}")
    fun getUsersByCompanyId(@PathVariable companyId: Int): ResponseEntity<ApiResponseDto<List<UserDto>>> {
        val result = getUsersByCompanyIdUseCase.getUsersByCompanyId(companyId)

        return if (result.isSuccess) {
            // 사용자 목록 조회 성공 시 사용자 목록을 반환
            val userDtos = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "회사별 사용자 목록 조회 성공",
                    data = userDtos
                )
            )
        } else {
            // 사용자 목록 조회 실패 시 에러 메시지 반환
            ResponseEntity.status(400).body(
                ApiResponseDto(
                    success = false,
                    message = "회사별 사용자 목록 조회 실패: ${result.exceptionOrNull()?.message ?: "조회 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "사용자 회사 초대 API",
        description = "이메일을 통해 사용자를 회사에 초대하는 API입니다."
    )
    @PostMapping("/invite/{companyId}")
    fun inviteUserToCompany(
        @PathVariable companyId: Int,
        @RequestBody inviteUserToCompanyRequest: InviteUserToCompanyRequest
    ): ResponseEntity<ApiResponseDto<UserDto>> {
        val command = inviteUserToCompanyRequest.toCommand(companyId)
        val result = inviteUserToCompanyUseCase.inviteUserToCompany(command)

        return if (result.isSuccess) {
            // 사용자 초대 성공 시 초대된 사용자 정보를 반환
            val userDto = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "사용자 회사 초대 성공",
                    data = userDto
                )
            )
        } else {
            // 사용자 초대 실패 시 에러 메시지 반환
            ResponseEntity.status(400).body(
                ApiResponseDto(
                    success = false,
                    message = "사용자 회사 초대 실패: ${result.exceptionOrNull()?.message ?: "초대 오류"}",
                    data = null
                )
            )
        }
    }
}
