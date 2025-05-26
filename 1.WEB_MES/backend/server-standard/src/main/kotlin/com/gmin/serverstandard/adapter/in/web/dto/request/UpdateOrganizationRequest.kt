package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.UpdateOrganizationCommand

/**
 * 조직 수정 요청을 위한 DTO 클래스
 */
data class UpdateOrganizationRequest(
    val organizationName: String,
    val companyId: Int? = null,
    val parentOrganizationId: Int? = null
) {
    /**
     * 요청 DTO를 커맨드 객체로 변환합니다.
     *
     * @param organizationId 수정할 조직 ID
     * @return 변환된 커맨드 객체
     */
    fun toCommand(organizationId: Int): UpdateOrganizationCommand {
        return UpdateOrganizationCommand(
            organizationId = organizationId,
            organizationName = organizationName,
            companyId = companyId,
            parentOrganizationId = parentOrganizationId
        )
    }
}
