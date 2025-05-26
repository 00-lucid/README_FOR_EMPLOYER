package com.gmin.serverstandard.application.port.`in`.command

/**
 * 조직 생성을 위한 커맨드 클래스
 *
 * 조직 생성에 필요한 데이터를 담고 있습니다.
 */
data class CreateOrganizationCommand(
    val organizationName: String,
    val companyId: Int?,
    val userIds: List<Int> = emptyList(),
    val parentOrganizationId: Int?
)