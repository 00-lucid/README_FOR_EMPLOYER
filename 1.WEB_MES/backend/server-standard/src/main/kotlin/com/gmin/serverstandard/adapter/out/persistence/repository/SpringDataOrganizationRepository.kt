package com.gmin.serverstandard.adapter.out.persistence.repository

import com.gmin.serverstandard.adapter.out.persistence.entity.OrganizationEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface SpringDataOrganizationRepository : JpaRepository<OrganizationEntity, Int> {
    fun findByOrganizationId(organizationId: Int): OrganizationEntity?

    fun findByCompanyId(companyId: Int): List<OrganizationEntity>

    @Query("SELECT o FROM OrganizationEntity o JOIN o.userOrganizations uo WHERE uo.userId = :userId")
    fun findByUserId(@Param("userId") userId: Int): List<OrganizationEntity>

    // 부모 조직 ID가 null인 루트 조직 조회
    fun findByParentOrganizationIdIsNull(): List<OrganizationEntity>

    // 특정 부모 조직 ID를 가진 자식 조직 조회
    fun findByParentOrganizationId(parentOrganizationId: Int): List<OrganizationEntity>
}
