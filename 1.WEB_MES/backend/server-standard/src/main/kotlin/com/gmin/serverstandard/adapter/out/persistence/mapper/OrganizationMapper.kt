package com.gmin.serverstandard.adapter.out.persistence.mapper

import com.gmin.serverstandard.adapter.out.persistence.entity.OrganizationEntity
import com.gmin.serverstandard.adapter.out.persistence.entity.UserOrganizationEntity
import com.gmin.serverstandard.application.domain.model.Organization
import com.gmin.serverstandard.application.domain.model.User
import org.springframework.stereotype.Component

@Component
class OrganizationMapper(
    private val userMapper: UserMapper
) {
    /**
     * OrganizationEntity를 도메인 엔티티인 Organization으로 매핑합니다.
     *
     * @param organizationEntity JPA 엔티티
     * @param includeUsers 사용자 정보를 포함할지 여부
     * @return 변환된 도메인 엔티티
     */
    fun mapToDomainEntity(
        organizationEntity: OrganizationEntity,
        includeUsers: Boolean = false
    ): Organization {
        val users = if (includeUsers && organizationEntity.userOrganizations.isNotEmpty()) {
            organizationEntity.userOrganizations
                .mapNotNull { it.user }
                .map { userMapper.mapToDomainEntity(it) }
        } else {
            emptyList()
        }

        return Organization(
            organizationId = organizationEntity.organizationId ?: 0,
            organizationName = organizationEntity.organizationName,
            createdAt = organizationEntity.createdAt,
            updatedAt = organizationEntity.updatedAt,
            companyId = organizationEntity.companyId,
            parentOrganizationId = organizationEntity.parentOrganizationId,
            users = users
        )
    }

    /**
     * 도메인 엔티티인 Organization을 JPA 엔티티로 매핑합니다.
     *
     * @param organization 도메인 엔티티
     * @return 변환된 JPA 엔티티
     */
    fun mapToJpaEntity(
        organization: Organization
    ): OrganizationEntity {
        return OrganizationEntity(
            organizationId = if (organization.organizationId == 0) null else organization.organizationId,
            organizationName = organization.organizationName,
            createdAt = organization.createdAt,
            updatedAt = organization.updatedAt,
            companyId = organization.companyId,
            parentOrganizationId = organization.parentOrganizationId
        )
    }

    /**
     * 도메인 엔티티 목록을 JPA 엔티티 목록으로 매핑합니다.
     *
     * @param organizations 도메인 엔티티 목록
     * @return 변환된 JPA 엔티티 목록
     */
    fun mapToJpaEntities(organizations: List<Organization>): List<OrganizationEntity> {
        return organizations.map { mapToJpaEntity(it) }
    }

    /**
     * JPA 엔티티 목록을 도메인 엔티티 목록으로 매핑합니다.
     *
     * @param organizationEntities JPA 엔티티 목록
     * @param includeUsers 사용자 정보를 포함할지 여부
     * @return 변환된 도메인 엔티티 목록
     */
    fun mapToDomainEntities(
        organizationEntities: List<OrganizationEntity>,
        includeUsers: Boolean = false
    ): List<Organization> {
        return organizationEntities.map { mapToDomainEntity(it, includeUsers) }
    }
}