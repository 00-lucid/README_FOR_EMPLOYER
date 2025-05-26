package com.gmin.serverstandard.adapter.out.persistence.adapter

import com.gmin.serverstandard.adapter.out.persistence.entity.UserOrganizationEntity
import com.gmin.serverstandard.adapter.out.persistence.mapper.OrganizationMapper
import com.gmin.serverstandard.adapter.out.persistence.repository.SpringDataOrganizationRepository
import com.gmin.serverstandard.adapter.out.persistence.repository.SpringDataUserOrganizationRepository
import com.gmin.serverstandard.application.domain.model.Organization
import com.gmin.serverstandard.application.port.out.DeleteOrganizationPort
import com.gmin.serverstandard.application.port.out.LoadOrganizationPort
import com.gmin.serverstandard.application.port.out.SaveOrganizationPort
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.util.Optional

@Component
@Transactional
class OrganizationPersistenceAdapter(
    private val organizationRepository: SpringDataOrganizationRepository,
    private val userOrganizationRepository: SpringDataUserOrganizationRepository,
    private val organizationMapper: OrganizationMapper
) : LoadOrganizationPort, SaveOrganizationPort, DeleteOrganizationPort {

    override fun findAll(): Optional<List<Organization>> {
        val organizations = organizationRepository.findAll()
        return if (organizations.isNotEmpty()) {
            Optional.of(organizationMapper.mapToDomainEntities(organizations, true))
        } else {
            Optional.of(emptyList())
        }
    }

    override fun findById(organizationId: Int): Optional<Organization> {
        val organizationEntity = organizationRepository.findByOrganizationId(organizationId)
        return if (organizationEntity != null) {
            Optional.of(organizationMapper.mapToDomainEntity(organizationEntity, true))
        } else {
            Optional.empty()
        }
    }

    override fun findByCompanyId(companyId: Int): Optional<List<Organization>> {
        val organizations = organizationRepository.findByCompanyId(companyId)
        return if (organizations.isNotEmpty()) {
            Optional.of(organizationMapper.mapToDomainEntities(organizations, true))
        } else {
            Optional.of(emptyList())
        }
    }

    override fun findByUserId(userId: Int): Optional<List<Organization>> {
        val organizations = organizationRepository.findByUserId(userId)
        return if (organizations.isNotEmpty()) {
            Optional.of(organizationMapper.mapToDomainEntities(organizations, true))
        } else {
            Optional.of(emptyList())
        }
    }

    override fun findRootOrganizations(): Optional<List<Organization>> {
        val organizations = organizationRepository.findByParentOrganizationIdIsNull()
        return if (organizations.isNotEmpty()) {
            Optional.of(organizationMapper.mapToDomainEntities(organizations, true))
        } else {
            Optional.of(emptyList())
        }
    }

    override fun findByParentOrganizationId(parentOrganizationId: Int): Optional<List<Organization>> {
        val organizations = organizationRepository.findByParentOrganizationId(parentOrganizationId)
        return if (organizations.isNotEmpty()) {
            Optional.of(organizationMapper.mapToDomainEntities(organizations, true))
        } else {
            Optional.of(emptyList())
        }
    }

    override fun save(organization: Organization): Organization {
        val organizationEntity = organizationMapper.mapToJpaEntity(organization)
        val savedEntity = organizationRepository.save(organizationEntity)
        return organizationMapper.mapToDomainEntity(savedEntity)
    }

    override fun addUserToOrganization(organizationId: Int, userId: Int): Boolean {
        // 이미 관계가 존재하는지 확인
        if (userOrganizationRepository.existsByUserIdAndOrganizationId(userId, organizationId)) {
            return true // 이미 존재하면 성공으로 간주
        }

        // 새 관계 생성
        val userOrganization = UserOrganizationEntity(
            userId = userId,
            organizationId = organizationId
        )

        try {
            userOrganizationRepository.save(userOrganization)
            return true
        } catch (e: Exception) {
            return false
        }
    }

    override fun removeUserFromOrganization(organizationId: Int, userId: Int): Boolean {
        try {
            val deletedCount = userOrganizationRepository.deleteByUserIdAndOrganizationId(userId, organizationId)
            return deletedCount > 0
        } catch (e: Exception) {
            return false
        }
    }

    override fun deleteById(organizationId: Int): Boolean {
        return try {
            // 먼저 해당 조직과 관련된 모든 사용자-조직 관계를 삭제
            val userOrganizations = userOrganizationRepository.findByOrganizationId(organizationId)
            userOrganizationRepository.deleteAll(userOrganizations)

            // 그 다음 조직 삭제
            organizationRepository.deleteById(organizationId)
            true
        } catch (e: Exception) {
            false
        }
    }
}
