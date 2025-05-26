package com.gmin.serverstandard.common.validation

import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
import java.util.Base64

@Component
class Sha256PasswordEncoder : PasswordEncoder {
    // 고정 솔트 (16바이트)
    private val fixedSalt = byteArrayOf(
        0x3A.toByte(), 0x41.toByte(), 0x5F.toByte(), 0x27.toByte(),
        0x8B.toByte(), 0x9C.toByte(), 0xD2.toByte(), 0xE3.toByte(),
        0x12.toByte(), 0x34.toByte(), 0x56.toByte(), 0x78.toByte(),
        0x9A.toByte(), 0xBC.toByte(), 0xDE.toByte(), 0xF0.toByte()
    )

    // 솔트 크기 (바이트)
    private val saltSize = 16

    // 반복 횟수
    private val iterations = 1

    override fun encode(rawPassword: CharSequence): String {
        // 비밀번호 해싱 (고정 솔트 사용)
        val hash = hashPassword(rawPassword.toString().toCharArray(), fixedSalt, iterations)

        // 솔트와 해시를 합쳐서 저장 (솔트는 고정이지만 여전히 저장)
        val combined = ByteArray(saltSize + hash.size)
        System.arraycopy(fixedSalt, 0, combined, 0, saltSize)
        System.arraycopy(hash, 0, combined, saltSize, hash.size)

        return Base64.getEncoder().encodeToString(combined)
    }

    override fun matches(rawPassword: CharSequence, encodedPassword: String): Boolean {
        try {
            // 저장된 솔트와 해시 분리
            val decoded = Base64.getDecoder().decode(encodedPassword)

            // 원본 해시 추출 (솔트 부분은 무시해도 됨, 이미 고정 솔트를 알고 있기 때문)
            val originalHash = ByteArray(decoded.size - saltSize)
            System.arraycopy(decoded, saltSize, originalHash, 0, originalHash.size)

            // 제공된 비밀번호를 고정 솔트로 해싱
            val testHash = hashPassword(rawPassword.toString().toCharArray(), fixedSalt, iterations)

            // 해시 비교
            return MessageDigest.isEqual(originalHash, testHash)
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        }
    }

    private fun hashPassword(password: CharArray, salt: ByteArray, iterations: Int): ByteArray {
        val digest = MessageDigest.getInstance("SHA-256")
        digest.reset()
        digest.update(salt)

        val pwdBytes = String(password).toByteArray(StandardCharsets.UTF_8)
        var hash = digest.digest(pwdBytes)

        for (i in 1 until iterations) {
            digest.reset()
            hash = digest.digest(hash)
        }

        return hash
    }
}