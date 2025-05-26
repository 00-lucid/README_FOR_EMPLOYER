package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Bom
import com.gmin.serverstandard.application.port.`in`.command.UpdateBomCommand

/**
 * BOM 수정을 위한 유스케이스 인터페이스
 */
interface UpdateBomUseCase {
    /**
     * BOM 정보를 수정합니다.
     *
     * @param command BOM 수정 명령 객체
     * @return 수정된 BOM (성공/실패 여부를 포함한 Result 객체)
     */
    fun updateBom(command: UpdateBomCommand): Result<Bom>
    
    /**
     * BOM에서 품목 정보를 수정합니다.
     *
     * @param bomId BOM ID
     * @param itemId 품목 ID
     * @param quantity 수정할 수량
     * @param remark 수정할 비고
     * @param parentItemId 수정할 부모 품목 ID
     * @return 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    fun updateItemInBom(
        bomId: Int,
        itemId: Int,
        quantity: Double,
        remark: String?,
        parentItemId: Int?
    ): Result<Boolean>
    
    /**
     * BOM에서 품목을 제거합니다.
     *
     * @param bomId BOM ID
     * @param itemId 제거할 품목 ID
     * @return 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    fun removeItemFromBom(bomId: Int, itemId: Int): Result<Boolean>
}