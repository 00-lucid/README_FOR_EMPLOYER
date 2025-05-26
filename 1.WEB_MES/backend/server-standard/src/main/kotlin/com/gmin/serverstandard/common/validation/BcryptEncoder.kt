package com.gmin.serverstandard.common.validation

import org.springframework.security.crypto.bcrypt.BCrypt
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component

@Component
class BcryptEncoder : PasswordEncoder {
    override fun encode(rawPassword: CharSequence?): String {
        if (rawPassword == null) {
            throw IllegalArgumentException("비밀번호는 null이 될 수 없습니다")
        }
        return BCrypt.hashpw(rawPassword.toString(), BCrypt.gensalt())
    }

    override fun matches(rawPassword: CharSequence?, encodedPassword: String?): Boolean {
        if (rawPassword == null || encodedPassword == null) {
            return false
        }
        return try {
            BCrypt.checkpw(rawPassword.toString(), encodedPassword)
        } catch (e: Exception) {
            // BCrypt 예외 처리 (잘못된 형식의 해시 등)
            false
        }
    }
}