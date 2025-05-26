package com.quokka.server.web.auth

import com.quokka.server.domain.user.SocialLoginData
import com.quokka.server.domain.user.User
import com.quokka.server.domain.user.UserRepository
import com.quokka.server.domain.user.UserService
import com.quokka.server.web.auth.dto.ErrorResult
import com.quokka.server.web.auth.dto.LoginData
import com.quokka.server.web.auth.dto.LoginUrl
import com.quokka.server.web.auth.dto.UserInfo
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
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
import java.nio.file.Files
import java.nio.file.Paths
import java.security.KeyFactory
import java.security.interfaces.ECPrivateKey
import java.security.spec.PKCS8EncodedKeySpec
import java.util.*


// todo: 리팩토링
@Api(tags = ["애플 로그인"], description = "애플 로그인")
@Controller
@RequestMapping("/apple")
class AppleLoginController(restTemplateBuilder: RestTemplateBuilder,
                           private val userRepository: UserRepository,
                           private val userService: UserService
) {

    @Value("\${apple.client_id}")
    private val clientId: String? = null
    @Value("\${apple.redirect_uri}")
    private val redirectUri: String? = null
    @Value("\${apple.kid}")
    private val appleKID: String? = null
    @Value("\${apple.iss}")
    private val appleISS: String? = null
    @Value("\${apple.key_file}")
    private val keyFile: String? = null

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

    @ApiOperation(value = "appleLogin - 1", notes = "로그인 url 응답")
    @PostMapping("/login")
    @ResponseBody
    fun login(@RequestBody loginData: LoginData): LoginUrl {
        return LoginUrl("https://appleid.apple.com/auth/authorize?response_type=code&redirect_uri=$redirectUri&client_id=$clientId&state=${loginData.uuid}")
    }

    @ApiOperation(value = "appleLogin - 2", notes = "로그인 완료 (로그인 시 사용했던 uuid 이어서 사용, 응답 후에는 uuid 삭제됨)")
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

        var userId = ""
        var accessToken = ""
        var refreshToken = ""
        var idToken = ""

        // 토큰 받기
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_FORM_URLENCODED

        val linkedMultiValueMap = LinkedMultiValueMap<String, String>()
        linkedMultiValueMap["grant_type"] = "authorization_code"
        linkedMultiValueMap["client_secret"] = createAppleClientSecret()
        linkedMultiValueMap["client_id"] = clientId
        linkedMultiValueMap["code"] = code

        val request = HttpEntity(linkedMultiValueMap, headers)

        try {
            val postForObject = restTemplate.postForObject("https://appleid.apple.com/auth/token", request, TokenResponseDto::class.java)

            if (postForObject != null) {
                accessToken = postForObject.access_token
                refreshToken = postForObject.let { it.refresh_token }
                idToken =  postForObject.id_token
            }

        } catch (e: Exception) {
            println("e = $e")
        }

        // 1. 사용자 정보 가져오기
        userId = decodeAppleIdToken(idToken)

        // 2. 유저정보 DB에 저장
        val socialLoginData = SocialLoginData(
                provider = SocialLoginData.SocialLoginProvider.APPLE,
                id = userId,
                accessToken = idToken,
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

    fun createAppleClientSecret(): String {
        // https://developer.apple.com/documentation/sign_in_with_apple/generate_and_validate_tokens

        val privateKeyContent = String(Files.readAllBytes(Paths.get(keyFile)))

        val pkcs8PrivateKey = privateKeyContent.replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replace("\n", "")

        val keySpec = PKCS8EncodedKeySpec(Base64.getDecoder().decode(pkcs8PrivateKey))
        val privateKey =  KeyFactory.getInstance("EC").generatePrivate(keySpec) as ECPrivateKey

        // Create JWT Header
        val header = mapOf(
                "alg" to "ES256",
                "kid" to appleKID
        )

        // Create JWT Payload
        val currentTime = System.currentTimeMillis() / 1000
        val payload = mapOf(
                "iss" to appleISS,
                "iat" to currentTime,
                "exp" to currentTime + 2592000, // 1 months in seconds
                "aud" to "https://appleid.apple.com",
                "sub" to clientId
        )

        // Sign the JWT
        return Jwts.builder()
                .setHeader(header)
                .setClaims(payload)
                .signWith(privateKey, SignatureAlgorithm.ES256)
                .compact()

    }

    private fun decodeAppleIdToken(token: String): String {
        val parts = token.split(".")
        if (parts.size != 3) {
            throw IllegalArgumentException("Invalid JWT token")
        }

        val payload = parts[1]
        val decodedBytes = Base64.getDecoder().decode(payload)
        val decodedPayload = String(decodedBytes)

        val map = decodedPayload.split(",").associate {
            val pair = it.split(":")
            pair[0].trim().removeSurrounding("\"") to pair[1].trim().removeSurrounding("\"")
        }

        return map["sub"] ?: throw IllegalArgumentException("sub not found in the JWT token")
    }

    data class TokenResponseDto (
            var access_token: String,
            var expires_in: Number = 0,
            var token_type: String = "",
            var id_token: String = "",
            var refresh_token: String = ""
    )
}