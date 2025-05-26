package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.Bom
import com.gmin.serverstandard.application.domain.model.ItemBom
import java.util.Optional

/**
 * BOM 조회를 위한 포트 인터페이스
 */
interface LoadBomPort {
    /**
     * 모든 BOM을 조회합니다.
     *
     * @return 모든 BOM 목록 (Optional로 감싸져 있음)
     */
    fun findAll(): Optional<List<Bom>>
    
    /**
     * 특정 ID의 BOM을 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 ID의 BOM (Optional로 감싸져 있음)
     */
    fun findById(bomId: Int): Optional<Bom>
    
    /**
     * 특정 상태의 BOM을 조회합니다.
     *
     * @param bomStatus 조회할 BOM 상태
     * @return 해당 상태의 BOM 목록 (Optional로 감싸져 있음)
     */
    fun findByStatus(bomStatus: String): Optional<List<Bom>>
    
    /**
     * 특정 BOM에 속한 품목 목록을 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 BOM에 속한 품목 BOM 목록 (Optional로 감싸져 있음)
     */
    fun findItemBomsByBomId(bomId: Int): Optional<List<ItemBom>>
    
    /**
     * 특정 BOM과 품목 ID로 ItemBom을 조회합니다.
     *
     * @param bomId BOM ID
     * @param itemId 품목 ID
     * @return 해당 BOM과 품목의 ItemBom (Optional로 감싸져 있음)
     */
    fun findItemBomByBomIdAndItemId(bomId: Int, itemId: Int): Optional<ItemBom>
}