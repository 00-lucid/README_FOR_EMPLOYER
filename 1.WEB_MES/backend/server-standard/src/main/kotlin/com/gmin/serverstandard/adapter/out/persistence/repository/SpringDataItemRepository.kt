package com.gmin.serverstandard.adapter.out.persistence.repository

import com.gmin.serverstandard.adapter.out.persistence.entity.ItemEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SpringDataItemRepository : JpaRepository<ItemEntity, Int> {
    /**
     * 특정 회사의 품목을 조회합니다.
     *
     * @param companyId 조회할 회사 ID
     * @return 해당 회사의 품목 목록
     */
    fun findByCompanyId(companyId: Int): List<ItemEntity>?
    
    /**
     * 특정 품목 타입의 품목을 조회합니다.
     *
     * @param itemType 조회할 품목 타입
     * @return 해당 타입의 품목 목록
     */
    fun findByItemType(itemType: String): List<ItemEntity>?
}