package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.User
import java.util.Optional

interface LoadUserPort {
    /**
     * 사용자 이름으로 계정 찾기
     */
    fun findByUsername(username: String): Optional<User>

    /**
     * 사용자 이메일로 계정 찾기
     */
    fun findByEmail(email: String): Optional<User>

    /**
     * 사용자 아이디로 계정 찾기
     */
    fun findByUserId(userId: Int): Optional<User>

    /**
     * 회사 아이디로 모든 사용자 찾기
     */
    fun findAllByCompanyId(companyId: Int): List<User>
}
