package com.gmin.serverstandard.adapter.`in`.web.dto

import com.gmin.serverstandard.application.domain.model.Organization
import java.time.LocalDateTime

/**
 * 조직 정보를 위한 DTO 클래스
 */
data class OrganizationDto(
    val organizationId: Int,
    val organizationName: String,
    val companyId: Int?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val parentOrganizationId: Int?,
    val users: List<UserDto> = emptyList()
) {
    companion object {
        /**
         * 도메인 모델을 DTO로 변환합니다.
         *
         * @param organization 변환할 도메인 모델
         * @return 변환된 DTO
         */
        fun fromDomain(organization: Organization): OrganizationDto {
            return OrganizationDto(
                organizationId = organization.organizationId,
                organizationName = organization.organizationName,
                companyId = organization.companyId,
                createdAt = organization.createdAt,
                updatedAt = organization.updatedAt,
                parentOrganizationId = organization.parentOrganizationId,
                users = organization.users.map { UserDto.fromDomain(it) }
            )
        }

        /**
         * 도메인 모델 목록을 DTO 목록으로 변환합니다.
         *
         * @param organizations 변환할 도메인 모델 목록
         * @return 변환된 DTO 목록
         */
        fun fromDomainList(organizations: List<Organization>): List<OrganizationDto> {
            return organizations.map { fromDomain(it) }
        }
    }
}
