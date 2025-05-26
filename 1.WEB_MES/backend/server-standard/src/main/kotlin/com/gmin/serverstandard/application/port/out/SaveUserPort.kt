package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.User

/**
 * 사용자 저장을 위한 포트
 */
interface SaveUserPort {
    /**
     * 새 사용자를 저장합니다.
     *
     * @param user 저장할 사용자 정보
     * @return 저장된 사용자 정보
     */
    fun saveUser(user: User): User
}