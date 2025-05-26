package com.gmin.serverstandard.adapter.out.persistence.repository

import com.gmin.serverstandard.adapter.out.persistence.entity.UserOrganizationEntity
import com.gmin.serverstandard.adapter.out.persistence.entity.UserOrganizationId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
interface SpringDataUserOrganizationRepository : JpaRepository<UserOrganizationEntity, UserOrganizationId> {
    fun findByUserId(userId: Int): List<UserOrganizationEntity>
    
    fun findByOrganizationId(organizationId: Int): List<UserOrganizationEntity>
    
    fun existsByUserIdAndOrganizationId(userId: Int, organizationId: Int): Boolean
    
    @Modifying
    @Transactional
    @Query("DELETE FROM UserOrganizationEntity uo WHERE uo.userId = :userId AND uo.organizationId = :organizationId")
    fun deleteByUserIdAndOrganizationId(@Param("userId") userId: Int, @Param("organizationId") organizationId: Int): Int
}