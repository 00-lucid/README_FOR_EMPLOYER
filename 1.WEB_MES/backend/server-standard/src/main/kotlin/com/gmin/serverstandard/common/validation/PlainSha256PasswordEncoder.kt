package com.gmin.serverstandard.common.validation

import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

/**
 * 솔트를 적용하지 않는 순수 SHA-256 해시 인코더
 *
 * 주의: 이 방식은 보안이 취약하며 오직 특별한 요구사항이 있을 때만 사용해야 합니다.
 */
@Component
class PlainSha256PasswordEncoder : PasswordEncoder {

    // TODO 현대 보안 표준에 적합하지 않은 SHA-256 해시함수, Salt 미적용으로 취약하기 때문에 빠른 수정이 필요.
    override fun encode(rawPassword: CharSequence): String {
        val digest = MessageDigest.getInstance("SHA-256")
        val encodedHash = digest.digest(rawPassword.toString().toByteArray(StandardCharsets.UTF_8))
        return bytesToHex(encodedHash)
    }

    override fun matches(rawPassword: CharSequence, encodedPassword: String): Boolean {
        return encode(rawPassword) == encodedPassword
    }

    private fun bytesToHex(hash: ByteArray): String {
        val hexString = StringBuilder(2 * hash.size)
        for (byte in hash) {
            val hex = Integer.toHexString(0xff and byte.toInt())
            if (hex.length == 1) {
                hexString.append('0')
            }
            hexString.append(hex)
        }
        return hexString.toString()
    }
}