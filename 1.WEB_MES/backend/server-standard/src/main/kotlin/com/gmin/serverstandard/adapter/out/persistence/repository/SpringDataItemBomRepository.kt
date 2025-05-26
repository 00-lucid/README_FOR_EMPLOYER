package com.gmin.serverstandard.adapter.out.persistence.repository

import com.gmin.serverstandard.adapter.out.persistence.entity.ItemBomEntity
import com.gmin.serverstandard.adapter.out.persistence.entity.ItemBomId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SpringDataItemBomRepository : JpaRepository<ItemBomEntity, ItemBomId> {
    /**
     * 특정 BOM에 속한 품목 목록을 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 BOM에 속한 품목 BOM 목록
     */
    fun findByBomId(bomId: Int): List<ItemBomEntity>?
    
    /**
     * 특정 품목이 속한 BOM 목록을 조회합니다.
     *
     * @param itemId 조회할 품목 ID
     * @return 해당 품목이 속한 BOM 목록
     */
    fun findByItemId(itemId: Int): List<ItemBomEntity>?
    
    /**
     * 특정 부모 품목 아래에 있는 품목 목록을 조회합니다.
     *
     * @param parentItemId 조회할 부모 품목 ID
     * @return 해당 부모 품목 아래에 있는 품목 BOM 목록
     */
    fun findByParentItemId(parentItemId: Int): List<ItemBomEntity>?
    
    /**
     * 특정 BOM과 품목 ID로 ItemBom을 조회합니다.
     *
     * @param bomId BOM ID
     * @param itemId 품목 ID
     * @return 해당 BOM과 품목의 ItemBom
     */
    fun findByBomIdAndItemId(bomId: Int, itemId: Int): ItemBomEntity?
    
    /**
     * 특정 BOM에 속한 최상위 품목 목록을 조회합니다. (부모 품목이 없는 품목)
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 BOM에 속한 최상위 품목 BOM 목록
     */
    fun findByBomIdAndParentItemIdIsNull(bomId: Int): List<ItemBomEntity>?
    
    /**
     * 특정 BOM과 품목 ID로 ItemBom을 삭제합니다.
     *
     * @param bomId BOM ID
     * @param itemId 품목 ID
     */
    fun deleteByBomIdAndItemId(bomId: Int, itemId: Int)
}