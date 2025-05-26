package com.gmin.serverstandard.adapter.out.persistence.repository

import com.gmin.serverstandard.adapter.out.persistence.entity.UserJpaEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SpringDataUserRepository : JpaRepository<UserJpaEntity, Int> {
    fun findByUsername(username: String): UserJpaEntity?
    fun findByEmail(email: String): UserJpaEntity?
    fun findByUserId(userId: Int): UserJpaEntity?
    fun findAllByCompanyId(companyId: Int): List<UserJpaEntity>
}
