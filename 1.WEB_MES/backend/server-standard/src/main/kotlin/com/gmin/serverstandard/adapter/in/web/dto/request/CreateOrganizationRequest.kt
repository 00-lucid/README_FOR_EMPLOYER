package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.CreateOrganizationCommand

/**
 * 조직 생성 요청을 위한 DTO 클래스
 */
data class CreateOrganizationRequest(
    val organizationName: String,
    val companyId: Int? = null,
    val userIds: List<Int> = emptyList(),
    val parentOrganizationId: Int? = null
) {
    /**
     * 요청 DTO를 커맨드 객체로 변환합니다.
     *
     * @return 변환된 커맨드 객체
     */
    fun toCommand(): CreateOrganizationCommand {
        return CreateOrganizationCommand(
            organizationName = organizationName,
            companyId = companyId,
            userIds = userIds,
            parentOrganizationId = parentOrganizationId
        )
    }
}