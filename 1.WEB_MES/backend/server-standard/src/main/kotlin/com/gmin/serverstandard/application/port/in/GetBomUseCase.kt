package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Bom
import com.gmin.serverstandard.application.domain.model.ItemBom

/**
 * BOM 조회를 위한 유스케이스 인터페이스
 */
interface GetBomUseCase {
    /**
     * 모든 BOM을 조회합니다.
     *
     * @return 모든 BOM 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getAllBoms(): Result<List<Bom>>
    
    /**
     * 특정 ID의 BOM을 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 ID의 BOM (성공/실패 여부를 포함한 Result 객체)
     */
    fun getBomById(bomId: Int): Result<Bom>
    
    /**
     * 특정 상태의 BOM을 조회합니다.
     *
     * @param bomStatus 조회할 BOM 상태
     * @return 해당 상태의 BOM 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getBomsByStatus(bomStatus: String): Result<List<Bom>>
    
    /**
     * 특정 BOM에 속한 품목 목록을 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 BOM에 속한 품목 BOM 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getItemBomsByBomId(bomId: Int): Result<List<ItemBom>>
    
    /**
     * 특정 BOM에 속한 품목 목록을 트리 구조로 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 BOM에 속한 품목 BOM 트리 구조 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getItemBomTreeByBomId(bomId: Int): Result<List<ItemBomTreeNode>>
    
    /**
     * 품목 BOM 트리 노드 클래스
     * 트리 구조를 표현하기 위한 중첩 클래스입니다.
     */
    data class ItemBomTreeNode(
        val itemBom: ItemBom,
        val children: List<ItemBomTreeNode> = emptyList()
    )
}