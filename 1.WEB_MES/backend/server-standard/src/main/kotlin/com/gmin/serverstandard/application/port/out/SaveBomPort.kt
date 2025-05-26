package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.Bom
import com.gmin.serverstandard.application.domain.model.ItemBom

/**
 * BOM 저장을 위한 포트 인터페이스
 */
interface SaveBomPort {
    /**
     * BOM을 저장합니다. (생성 또는 수정)
     *
     * @param bom 저장할 BOM 도메인 엔티티
     * @return 저장된 BOM 도메인 엔티티
     */
    fun save(bom: Bom): Bom
    
    /**
     * 품목 BOM을 저장합니다. (생성 또는 수정)
     *
     * @param itemBom 저장할 품목 BOM 도메인 엔티티
     * @return 저장된 품목 BOM 도메인 엔티티
     */
    fun saveItemBom(itemBom: ItemBom): ItemBom
    
    /**
     * 품목 BOM을 삭제합니다.
     *
     * @param bomId BOM ID
     * @param itemId 품목 ID
     * @return 삭제 성공 여부
     */
    fun deleteItemBom(bomId: Int, itemId: Int): Boolean
}