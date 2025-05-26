package com.quokka.server.web.auth

import com.quokka.server.domain.user.SocialLoginData
import com.quokka.server.domain.user.UserRepository
import com.quokka.server.web.auth.dto.AccessTokenResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.web.client.RestTemplateBuilder
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException
import org.springframework.http.HttpEntity
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpMethod
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.client.RestTemplate
import java.util.*
import javax.naming.AuthenticationException

@Service
class AuthService(
        restTemplateBuilder: RestTemplateBuilder,
        private val userRepository: UserRepository,
        private val appleLoginController: AppleLoginController, // TODO: 리팩토링
) {
    @Value("\${apple.client_id}")
    private val appleClientId: String? = null
    @Value("\${kakao.client_id}")
    private val kakaoClientId: String? = null
    @Value("\${google.client_id}")
    private val googleClientId: String? = null
    @Value("\${google.client_secret}")
    private val googleClientSecret: String? = null

    private val restTemplate: RestTemplate

    init {
        restTemplate = restTemplateBuilder.build()
    }

    fun verifyToken(accessToken: String): String {
        var result = ""
        result = verifyKaKaoToken(accessToken)
        if (result == "") result = verifyGoogleToken(accessToken)
        if (result == "") result = verifyAppleToken(accessToken)
        if (result == "") throw AuthenticationException()
        return result;
    }

    // https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#get-token-info
    private fun verifyKaKaoToken(accessToken: String): String {
        data class KakaoTokenInfo(
                val id: Long,
                val expires_in: Int,
                val app_id:Int,
        )
        val headers = HttpHeaders()
        headers.set("Authorization", "Bearer $accessToken")

        val request = HttpEntity<Any>(headers)

        return try {
            val response = restTemplate.exchange(
                    "https://kapi.kakao.com/v1/user/access_token_info",
                    HttpMethod.GET,
                    request,
                    KakaoTokenInfo::class.java
            )
            response.body!!.id.toString()

        } catch (e: Exception) {
            println("Executing verifyKaKaoToken = $e")
            ""
        }
    }

    private fun verifyGoogleToken(accessToken: String): String {
        data class GoogleTokenInfo(
                val user_id: String,
        )
        val headers = HttpHeaders()
        headers.set("Authorization", "Bearer $accessToken")

        val request = HttpEntity<Any>(headers)

        return try {
            val response = restTemplate.exchange(
                    "https://www.googleapis.com/oauth2/v1/tokeninfo",
                    HttpMethod.GET,
                    request,
                    GoogleTokenInfo::class.java
            )
            response.body!!.user_id

        } catch (e: Exception) {
            println("Executing verifyKaKaoToken = $e")
            ""
        }
    }

    private fun verifyAppleToken(token: String): String {
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

        return map["sub"] ?: ""
    }

    fun renewToken(userId: String, refreshToken: String): AccessTokenResponse {
        val user = userRepository.findByUserId(userId) ?: throw NotFoundException()
        val snsType = user.socialLoginData?.provider

        lateinit var accessToken: AccessTokenResponse
        if (snsType == SocialLoginData.SocialLoginProvider.APPLE) accessToken = renewAppleToken(refreshToken)
        if (snsType == SocialLoginData.SocialLoginProvider.KAKAO) accessToken = renewKakaoToken(refreshToken)
        if (snsType == SocialLoginData.SocialLoginProvider.GOOGLE) accessToken = renewGoogleToken(refreshToken)

        return accessToken
    }

    private fun renewAppleToken(refreshToken: String): AccessTokenResponse {
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_FORM_URLENCODED

        val linkedMultiValueMap = LinkedMultiValueMap<String, String>()
        linkedMultiValueMap["grant_type"] = "refresh_token"
        linkedMultiValueMap["client_id"] = appleClientId
        linkedMultiValueMap["client_secret"] = appleLoginController.createAppleClientSecret()
        linkedMultiValueMap["refresh_token"] = refreshToken

        val request = HttpEntity(linkedMultiValueMap, headers)

        lateinit var postForObject: AppleResponseTokenDto
        try {
            postForObject = restTemplate.postForObject("https://appleid.apple.com/auth/token", request, AppleResponseTokenDto::class.java)!!
        } catch (e: Exception) {
            println("Executing renewAppleToken = $e")
            throw AuthenticationException()
        }

        return AccessTokenResponse(postForObject.access_token, postForObject.expires_in)
    }

    data class AppleResponseTokenDto (
            var access_token: String,
            var token_type: String,
            var expires_in: Int,
            var id_token: String,
    )

    private fun renewKakaoToken(refreshToken: String): AccessTokenResponse {
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_FORM_URLENCODED

        val linkedMultiValueMap = LinkedMultiValueMap<String, String>()
        linkedMultiValueMap["grant_type"] = "refresh_token"
        linkedMultiValueMap["client_id"] = kakaoClientId
        linkedMultiValueMap["refresh_token"] = refreshToken

        val request = HttpEntity(linkedMultiValueMap, headers)

        lateinit var postForObject: KakaoResponseTokenDto
        try {
            postForObject = restTemplate.postForObject("https://kauth.kakao.com/oauth/token", request, KakaoResponseTokenDto::class.java)!!
        } catch (e: Exception) {
            println("Executing renewKakaoToken = $e")
            throw AuthenticationException()
        }

        return AccessTokenResponse(postForObject.access_token, postForObject.expires_in)
    }

    data class KakaoResponseTokenDto (
            var access_token: String,
            var token_type: String,
            var expires_in: Int,
    )

    private fun renewGoogleToken(refreshToken: String): AccessTokenResponse {
        val headers = HttpHeaders()
        headers.contentType = MediaType.APPLICATION_FORM_URLENCODED

        val linkedMultiValueMap = LinkedMultiValueMap<String, String>()
        linkedMultiValueMap["grant_type"] = "refresh_token"
        linkedMultiValueMap["client_id"] = googleClientId
        linkedMultiValueMap["client_secret"] = googleClientSecret
        linkedMultiValueMap["refresh_token"] = refreshToken

        val request = HttpEntity(linkedMultiValueMap, headers)

        lateinit var postForObject: GoogleResponseTokenDto
        try {
            postForObject = restTemplate.postForObject("https://oauth2.googleapis.com/token", request, GoogleResponseTokenDto::class.java)!!
        } catch (e: Exception) {
            println("Executing renewGoogleToken = $e")
            throw AuthenticationException()
        }

        return AccessTokenResponse(postForObject.access_token, postForObject.expires_in)
    }

    data class GoogleResponseTokenDto (
            var access_token: String,
            var token_type: String,
            var expires_in: Int,
            var scope: String,
    )

}