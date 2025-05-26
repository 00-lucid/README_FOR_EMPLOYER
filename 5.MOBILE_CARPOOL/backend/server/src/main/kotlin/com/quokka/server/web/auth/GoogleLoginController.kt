package com.quokka.server.web.auth

import com.quokka.server.domain.user.SocialLoginData
import com.quokka.server.domain.user.User
import com.quokka.server.domain.user.UserRepository
import com.quokka.server.domain.user.UserService
import com.quokka.server.web.auth.dto.ErrorResult
import com.quokka.server.web.auth.dto.LoginData
import com.quokka.server.web.auth.dto.LoginUrl
import com.quokka.server.web.auth.dto.UserInfo
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.core.io.ClassPathResource
import org.springframework.http.*
import org.springframework.stereotype.Controller
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.bind.annotation.*
import org.springframework.web.client.RestTemplate
import springfox.documentation.annotations.ApiIgnore

// todo: 리팩토링
@Api(tags = ["구글 로그인"], description = "구글 로그인")
@Controller
@RequestMapping("/google")
class GoogleLoginController(restTemplateBuilder: RestTemplateBuilder,
                            private val userRepository: UserRepository,
                            private val userService: UserService
) {

    @Value("\${google.client_id}")
    private val clientId: String? = null
    @Value("\${google.client_secret}")
    private val clientSecret: String? = null
    @Value("\${google.redirect_uri}")
    private val redirectUri: String? = null

    private val restTemplate: RestTemplate

    init {
        restTemplate = restTemplateBuilder.build()
    }

    @ExceptionHandler
    fun notUserExHandle(e: IllegalStateException): ErrorResult {
        return ErrorResult(
                404,
                "Not Found"
        )
    }

    @ApiOperation(value = "googleLogin - 1", notes = "로그인 url 응답")
    @PostMapping("/login")
    @ResponseBody
    fun login(@RequestBody loginData: LoginData): LoginUrl {
        return LoginUrl("https://accounts.google.com/o/oauth2/v2/auth?scope=profile&response_type=code&redirect_uri=$redirectUri&client_id=$clientId&access_type=offline&state=${loginData.uuid}")
    }

    @ApiOperation(value = "googleLogin - 2", notes = "로그인 완료 (로그인 시 사용했던 uuid 이어서 사용, 응답 후에는 uuid 삭제됨)")
    @PostMapping("/userId/get")
    @ResponseBody
    fun getUserId(@RequestBody loginData: LoginData): UserInfo {
        val user = userRepository.findByUuid(loginData.uuid)
            return UserInfo(
                    user!!.userId,
                    user.userData?.username,
                    user.socialLoginData?.accessToken ?: "",
                    user.socialLoginData?.refreshToken ?: "",
            )
    }

    @ApiIgnore
    @GetMapping("/code")
    fun getCode(@RequestParam code: String, @RequestParam state: String): ResponseEntity<ByteArray> {
        var userId: String = ""
        var accessToken: String = ""
        var refreshToken: String = ""

        // step1. 토큰 받기
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_FORM_URLENCODED

        val linkedMultiValueMap = LinkedMultiValueMap<String, String>()
        linkedMultiValueMap["grant_type"] = "authorization_code"
        linkedMultiValueMap["client_secret"] = clientSecret
        linkedMultiValueMap["client_id"] = clientId
        linkedMultiValueMap["redirect_uri"] = redirectUri
        linkedMultiValueMap["code"] = code

        val request = HttpEntity(linkedMultiValueMap, headers)

        try {
            val postForObject = restTemplate.postForObject("https://accounts.google.com/o/oauth2/token", request, TokenResponseDto::class.java)

            if (postForObject != null) {
                accessToken = postForObject.access_token
                refreshToken = postForObject.let { it.refresh_token }
            }

        } catch (e: Exception) {
            println("e = $e")
        }

        // step2. 사용자 로그인 처리
        // 1. 사용자 정보 가져오기
        val headers2 = HttpHeaders()
        headers2.contentType = MediaType.APPLICATION_FORM_URLENCODED
        headers2.set("Authorization", "Bearer $accessToken")

        val request2 = HttpEntity<Any>(headers2)

        try {
            val responseEntity = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    HttpMethod.GET,
                    request2,
                    InfoDto::class.java
            )

            userId = responseEntity.body?.sub.toString()

        } catch (e: Exception) {
            println("e2 = $e")
        }

        // 2. 유저정보 DB에 저장
        val socialLoginData = SocialLoginData(
                provider = SocialLoginData.SocialLoginProvider.GOOGLE,
                id = userId,
                accessToken = accessToken,
                refreshToken = refreshToken,
//                uuid = state
        )

        val user = userRepository.findByUserId(userId)
        if (user == null) {
            userRepository.save(User(
                    userId = userId,
                    socialLoginData = socialLoginData,
                    uuid = state
            ))
        } else {
//            socialLoginData.refreshToken = user.socialLoginData?.refreshToken ?: refreshToken
            userService.update(userId, state, socialLoginData)
        }

        val htmlFile = ClassPathResource("static/complete-login.html")
        val bytes = htmlFile.inputStream.readBytes()
        return ResponseEntity.ok().body(bytes)

//        return UserInfo(
//                userId,
//                userRepository.findByUserId(userId)?.userData?.username,
//                accessToken,
//                refreshToken
//        )

    }

    data class TokenResponseDto (
            var access_token: String,
            var expires_in: Number = 0,
            var token_type: String = "",
            var scope: String = "",
            var refresh_token: String = ""
    )

    data class InfoDto (
            var sub: String,
            var name: String,
            var given_name: String,
            var picture: String,
            var locale: String
    )
}