package com.gmin.serverstandard.adapter.out.persistence.repository

import com.gmin.serverstandard.adapter.out.persistence.entity.NoticeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SpringDataNoticeRepository: JpaRepository<NoticeEntity, Int> {
    fun findByCompanyId(companyId: Int): List<NoticeEntity>?
}