package com.gmin.serverstandard.application.port.`in`.command

/**
 * 조직 수정을 위한 커맨드 클래스
 *
 * 조직 수정에 필요한 데이터를 담고 있습니다.
 */
data class UpdateOrganizationCommand(
    val organizationId: Int,
    val organizationName: String,
    val companyId: Int?,
    val parentOrganizationId: Int?
)
