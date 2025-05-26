package com.gmin.serverstandard.adapter.out.persistence.adapter

import com.gmin.serverstandard.adapter.`in`.web.dto.AuthTokenDto
import com.gmin.serverstandard.application.domain.model.User
import com.gmin.serverstandard.application.port.out.AuthTokenPort
import com.gmin.serverstandard.application.port.out.LoadUserPort
import io.jsonwebtoken.ExpiredJwtException
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.SignatureAlgorithm
import io.jsonwebtoken.security.Keys
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.security.authentication.ott.InvalidOneTimeTokenException
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.security.Key
import java.security.MessageDigest
import java.security.SignatureException
import java.util.Date
import java.util.concurrent.TimeUnit

@Component
class AuthTokenPersistenceAdapter(
    private val loadUserPort: LoadUserPort,
    private val redisTemplate: RedisTemplate<String, String> // TODO 해당 주입 방식이 적절한가?
) : AuthTokenPort {

    // JWT 비밀키, 실제로는 설정 파일에서 주입받는 것이 좋습니다
    private val secretKey = "SALT01"

    // 액세스 토큰 만료 시간(초), 예: 1시간
    private val accessTokenExpirationTime = 3600L

    // 리프레시 토큰 만료 시간(초), 예: 14일
    private val refreshTokenExpirationTime = 1209600L  // 14일

    override fun generateAuthToken(user: User): AuthTokenDto {
        // 현재 시간
        val now = Date()

        // 액세스 토큰 만료 시간 설정
        val accessTokenExpiration = Date(now.time + accessTokenExpirationTime * 1000)

        // 리프레시 토큰 만료 시간 설정
        val refreshTokenExpiration = Date(now.time + refreshTokenExpirationTime * 1000)

        // User 객체를 기반으로 클레임(Payload) 구성
        val claims = mutableMapOf<String, Any>()
        claims["companyId"] = user.companyId
        claims["userId"] = user.userId
        claims["username"] = user.username
        claims["email"] = user.email
        // 민감한 정보인 passwordHash는 클레임에 포함하지 않음
        claims["createdAt"] = user.createdAt.toString()
        claims["updatedAt"] = user.updatedAt.toString()

        // 액세스 토큰 생성
        val accessToken = Jwts.builder()
            .setSubject(user.userId.toString())
            .setIssuedAt(now) // 토큰 발행 시간
            .setExpiration(accessTokenExpiration) // 토큰 만료 시간
            .addClaims(claims) // User 객체 기반 클레임 정보
            .setIssuer("yourApplication") // 발행자
            .setAudience("yourApi") // 대상자
            .setHeaderParam("typ", "JWT") // 토큰 타입
            .signWith(getSigningKey(), SignatureAlgorithm.HS256) // 서명 알고리즘과 키 설정
            .compact() // 토큰 생성 및 직렬화

        // 리프레시 토큰 생성 (액세스 토큰보다 간소화된 클레임)
        val refreshClaims = mutableMapOf<String, Any>()
        refreshClaims["userId"] = user.userId
        refreshClaims["tokenType"] = "refresh"

        val refreshToken = Jwts.builder()
            .setSubject(user.userId.toString())
            .setIssuedAt(now)
            .setExpiration(refreshTokenExpiration)
            .addClaims(refreshClaims)
            .setIssuer("yourApplication")
            .setHeaderParam("typ", "JWT")
            .signWith(getSigningKey(), SignatureAlgorithm.HS256)
            .compact()

        // 생성된 토큰과 만료 시간을 포함한 DTO 반환
        return AuthTokenDto(
            accessToken = accessToken,
            refreshToken = refreshToken,
            accessTokenExpiresIn = accessTokenExpirationTime,
            refreshTokenExpiresIn = refreshTokenExpirationTime
        )
    }

    override fun refreshAccessToken(refreshToken: String): Result<AuthTokenDto> {
        try {
            val userId = getUserIdFromToken(refreshToken)
                ?: return Result.failure(InvalidOneTimeTokenException("토큰에서 사용자 ID를 추출할 수 없습니다."))

            // 사용자 정보로 새 토큰 발급
            val userOptional = loadUserPort.findByUserId(userId)

            if (userOptional.isEmpty) {
                return Result.failure(IllegalArgumentException("존재하지 않는 사용자입니다"))
            }

            val user = userOptional.get()

            return Result.success(generateAuthToken(user))
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }

    // 서명 키 생성 메서드 (기존 코드 유지)
    override fun getSigningKey(): Key {
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

    // 토큰 검증 메서드 (기존 코드 유지)
    override fun validateToken(token: String): Boolean {
        try {
            Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
            return true
        } catch (e: Exception) {
            // 토큰 검증 실패 시 다양한 예외 처리
            when (e) {
                is ExpiredJwtException -> {
                    // logger.info("만료된 JWT 토큰입니다: ${e.message}")
                }
                is SignatureException -> {
                    // logger.info("유효하지 않은 JWT 서명입니다: ${e.message}")
                }
                is IllegalArgumentException -> {
                    // logger.info("JWT 클레임 문자열이 비어있습니다: ${e.message}")
                }
                else -> {
                    // logger.info("JWT 토큰 검증 중 예외 발생: ${e.message}")
                }
            }
            return false
        }
    }

    // 토큰에서 사용자 정보 추출 메서드 (기존 코드 유지)
    override fun getUserIdFromToken(token: String): Int? {
        return try {
            val claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .body

            claims.subject.toInt()
        } catch (e: Exception) {
            null
        }
    }

    // 토큰 블랙리스트 구현 (Redis 활용)
    override fun invalidateToken(token: String) {
        val expiration = getExpirationFromToken(token)
        val ttl = expiration.time - System.currentTimeMillis()

        if (ttl > 0) {
            redisTemplate.opsForValue().set(
                "blacklist:$token",
                "invalidated",
                ttl,
                TimeUnit.MILLISECONDS
            )
        }
    }

    override fun isTokenBlacklisted(token: String): Boolean {
        return redisTemplate.hasKey("blacklist:$token") == true
    }

    // TODO 해당 함수의 위치가 적절한가?
    private fun getExpirationFromToken(token: String): Date {
        return Jwts.parserBuilder()
            .setSigningKey(getSigningKey())
            .build()
            .parseClaimsJws(token)
            .body
            .expiration
    }
}