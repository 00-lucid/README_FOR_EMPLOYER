package com.gmin.serverstandard.application.domain.model

import java.time.LocalDateTime

/**
 * 조직 도메인 모델
 *
 * 조직의 기본 정보를 담고 있는 도메인 엔티티입니다.
 */
data class Organization(
    val organizationId: Int,
    val organizationName: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val companyId: Int?,
    val parentOrganizationId: Int?,
    val users: List<User> = emptyList()
)