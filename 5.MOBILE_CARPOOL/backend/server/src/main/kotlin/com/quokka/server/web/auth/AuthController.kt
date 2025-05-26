package com.quokka.server.web.auth

import com.quokka.server.domain.user.UserRepository
import com.quokka.server.web.auth.dto.*
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.RestTemplate
import javax.naming.AuthenticationException

// todo: 리팩토링
@Api(tags = ["Auth"], description = "토큰 관련")
@RestController
@RequestMapping("/auth")
class AuthController(
        restTemplateBuilder: RestTemplateBuilder,
        private val authService: AuthService) {

    private val restTemplate: RestTemplate

    init {
        restTemplate = restTemplateBuilder.build()
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler
    fun notUserExHandle(e: AuthenticationException): ErrorResult {
        return ErrorResult(
                401,
                "Unauthorized"
        )
    }

    @ApiOperation(value = "accessToken 받기", notes = "refreshToken을 이용해 accessToken을 요청합니다.")
    @PostMapping("/token")
    fun getToken(@RequestBody getTokenDto: GetTokenDto): AccessTokenResponse {
        return authService.renewToken(getTokenDto.userId, getTokenDto.refreshToken)
    }

    data class GetTokenDto (
            var userId: String,
            var refreshToken: String,
    )

}