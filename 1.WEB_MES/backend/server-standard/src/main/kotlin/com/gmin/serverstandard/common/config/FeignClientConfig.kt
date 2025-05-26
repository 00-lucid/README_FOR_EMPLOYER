package com.gmin.serverstandard.common.config

import feign.Logger
import feign.Request
import feign.RequestInterceptor
import feign.codec.ErrorDecoder
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.util.concurrent.TimeUnit
import org.springframework.security.core.context.SecurityContextHolder

@Configuration
class FeignClientConfig {

    @Bean
    fun requestInterceptor(): RequestInterceptor {
        return RequestInterceptor { requestTemplate ->
            // 현재 요청의 인증 토큰 가져오기
            val authentication = SecurityContextHolder.getContext().authentication

            if (authentication != null && authentication.isAuthenticated) {
                val details = authentication.details as? Map<String, Any>
                val token = details?.get("accessToken") as? String

                if (!token.isNullOrEmpty()) {
                    requestTemplate.header("Authorization", "Bearer $token")
                }
            }
        }
    }

    @Bean
    fun feignLoggerLevel(): Logger.Level {
        return Logger.Level.FULL // 로깅 레벨 (NONE, BASIC, HEADERS, FULL)
    }

    @Bean
    fun requestOptions(): Request.Options {
        return Request.Options(
            5, TimeUnit.SECONDS, // 연결 타임아웃
            30, TimeUnit.SECONDS, // 읽기 타임아웃
            true // 리다이렉트 허용
        )
    }

    @Bean
    fun errorDecoder(): ErrorDecoder {
        return ErrorDecoder { methodKey, response ->
            when (response.status()) {
                404 -> RuntimeException("요청한 리소스를 찾을 수 없습니다: $methodKey")
                500 -> RuntimeException("서버 오류가 발생했습니다: $methodKey")
                else -> RuntimeException("API 호출 중 오류 발생: ${response.status()} $methodKey")
            }
        }
    }
}
