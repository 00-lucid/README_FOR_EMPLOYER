package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.InviteUserToCompanyCommand

/**
 * 사용자를 회사에 초대하는 요청 DTO
 */
data class InviteUserToCompanyRequest(
    val email: String
) {
    /**
     * InviteUserToCompanyRequest를 InviteUserToCompanyCommand로 변환합니다.
     *
     * @param companyId 초대할 회사의 ID
     * @return 변환된 InviteUserToCompanyCommand 객체
     */
    fun toCommand(companyId: Int): InviteUserToCompanyCommand {
        return InviteUserToCompanyCommand(
            email = email,
            companyId = companyId
        )
    }
}