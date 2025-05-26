package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.adapter.`in`.web.dto.UserDto

interface GetUsersByCompanyIdUseCase {
    /**
     * 특정 회사에 속한 모든 사용자를 조회합니다.
     *
     * @param companyId 회사 ID
     * @return 회사에 속한 사용자 목록을 담은 Result 객체
     */
    fun getUsersByCompanyId(companyId: Int): Result<List<UserDto>>
}