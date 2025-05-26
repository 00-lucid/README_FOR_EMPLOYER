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
import java.time.LocalDateTime

// todo: 리팩토링
@Api(tags = ["카카오 로그인"], description = "카카오 로그인")
@Controller
@RequestMapping("/kakao")
class KakaoLoginController(
        restTemplateBuilder: RestTemplateBuilder,
        private val userRepository: UserRepository,
        private val userService: UserService) {

    @Value("\${kakao.client_id}")
    private val clientId: String? = null
    @Value("\${kakao.redirect_uri}")
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

    @ApiOperation(value = "kakaoLogin - 1", notes = "로그인 url 응답")
    @PostMapping("/login")
    @ResponseBody
    fun login(@RequestBody loginData: LoginData): LoginUrl {
        return LoginUrl("https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=$clientId&redirect_uri=$redirectUri&state=${loginData.uuid}")
    }

    @ApiOperation(value = "kakaoLogin - 2", notes = "로그인 완료 (로그인 시 사용했던 uuid 이어서 사용, 응답 후에는 uuid 삭제됨)")
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

    /**
     * 직접 요청x (api 필요 없음)
     */
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
        linkedMultiValueMap["client_id"] = clientId
        linkedMultiValueMap["redirect_uri"] = redirectUri
        linkedMultiValueMap["code"] = code

        val request = HttpEntity(linkedMultiValueMap, headers)

        try {
            val postForObject = restTemplate.postForObject("https://kauth.kakao.com/oauth/token", request, TokenResponseDto::class.java)

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
                    "https://kapi.kakao.com/v2/user/me",
                    HttpMethod.GET,
                    request2,
                    InfoDto::class.java
            )

            userId = responseEntity.body?.id.toString()

        } catch (e: Exception) {
            println("e2 = $e")
        }

        // 2. 유저정보 DB에 저장
        val socialLoginData = SocialLoginData(
                provider = SocialLoginData.SocialLoginProvider.KAKAO,
                id = userId,
                accessToken = accessToken,
                refreshToken = refreshToken,
//                uuid = "Dd"
        )

        val user = userRepository.findByUserId(userId)
        if (user == null) {
            userRepository.save(User(
                    userId = userId,
                    socialLoginData = socialLoginData,
                    uuid = state,
            ))
        } else {
//            socialLoginData.refreshToken = user.socialLoginData?.refreshToken ?: ""
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

    data class InfoDto (
            var id: Number,
            var connected_at: LocalDateTime
    )

    data class TokenResponseDto (
            var token_type: String,
            var access_token: String,
            var expires_in: String,
            var refresh_token: String,
            var refresh_token_expires_in: Number
    )

}