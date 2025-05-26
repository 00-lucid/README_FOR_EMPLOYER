package com.gmin.servereaglered.config

import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.config.annotation.web.invoke
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.OncePerRequestFilter
import java.nio.charset.StandardCharsets
import java.security.Key
import java.security.MessageDigest

// server-eaglered의 SecurityConfig 구현 예시
@Configuration
@EnableWebSecurity
class SecurityConfig {
    // TODO Must private
    private val secretKey = "SALT01"

    fun getSigningKey(): Key {
        // 프로덕션 환경에서는 환경 변수나 안전한 저장소에서 비밀 키를 가져와야 합니다
        val secretKeyBytes = secretKey.toByteArray(StandardCharsets.UTF_8)

        // 적어도 64바이트(512비트) 이상의 안전한 키를 사용하는 것이 좋습니다
        // 키 길이가 부족한 경우 해싱을 통해 길이를 늘릴 수 있습니다
        return if (secretKeyBytes.size >= 64) {
            Keys.hmacShaKeyFor(secretKeyBytes)
        } else {
            // 키 길이가 부족한 경우 해싱을 통해 안전한 키 생성
            val hashedKey = MessageDigest.getInstance("SHA-512")
                .digest(secretKeyBytes)
            Keys.hmacShaKeyFor(hashedKey)
        }
    }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http {
            csrf { disable() }
            sessionManagement {
                sessionCreationPolicy = SessionCreationPolicy.STATELESS
            }
            addFilterBefore<UsernamePasswordAuthenticationFilter>(JwtAuthenticationFilter(getSigningKey()))
            exceptionHandling {
                authenticationEntryPoint = JwtAuthenticationEntryPoint()
            }
            authorizeRequests {
                authorize("/api/**", authenticated)
            }
        }
        return http.build()
    }

    // JWT 토큰 검증 필터 - server-standard와 동일한 비밀키 사용
    class JwtAuthenticationFilter(
        private val signingKey: Key
    ) : OncePerRequestFilter() {
        override fun doFilterInternal(
            request: HttpServletRequest,
            response: HttpServletResponse,
            filterChain: FilterChain
        ) {
            val token = request.getHeader("Authorization")?.substringAfter("Bearer ")
            if (!token.isNullOrEmpty()) {
                try {
                    // server-standard와 동일한 방식으로 토큰 검증
                    val claims = Jwts.parser()
                        .setSigningKey(signingKey)
                        .parseClaimsJws(token)
                        .body

                    val userId = claims["userId"]
                    val authorities = listOf(SimpleGrantedAuthority("ROLE_USER"))

                    // 인증 객체 생성 (credentials는 null)
                    val authentication = UsernamePasswordAuthenticationToken(userId, null, authorities)

                    // Details 필드에 토큰 저장
                    val details = mutableMapOf<String, Any>()
                    details["token"] = token
                    authentication.details = details

                    SecurityContextHolder.getContext().authentication = authentication
                } catch (e: Exception) {
                    // 토큰 검증 실패
                }
            }
            filterChain.doFilter(request, response)
        }
    }

    // 인증 실패 응답 처리기
    class JwtAuthenticationEntryPoint : AuthenticationEntryPoint {
        override fun commence(
            request: HttpServletRequest,
            response: HttpServletResponse,
            authException: AuthenticationException
        ) {
            response.contentType = "application/json;charset=UTF-8"
            response.status = HttpServletResponse.SC_UNAUTHORIZED

            val errorResponse = """
                {
                    "success": false,
                    "message": "인증이 필요한 요청입니다. 유효한 토큰을 제공해주세요.",
                    "data": null
                }
            """.trimIndent()

            response.writer.write(errorResponse)
        }
    }
}
