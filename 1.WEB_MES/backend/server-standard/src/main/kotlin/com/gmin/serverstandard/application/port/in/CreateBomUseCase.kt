package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Bom
import com.gmin.serverstandard.application.port.`in`.command.CreateBomCommand

/**
 * BOM 생성을 위한 유스케이스 인터페이스
 */
interface CreateBomUseCase {
    /**
     * 새로운 BOM을 생성합니다.
     *
     * @param command BOM 생성 명령 객체
     * @return 생성된 BOM (성공/실패 여부를 포함한 Result 객체)
     */
    fun createBom(command: CreateBomCommand): Result<Bom>
    
    /**
     * BOM에 품목을 추가합니다.
     *
     * @param bomId 품목을 추가할 BOM ID
     * @param itemId 추가할 품목 ID
     * @param quantity 수량
     * @param remark 비고
     * @param parentItemId 부모 품목 ID (null인 경우 최상위 품목)
     * @return 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    fun addItemToBom(
        bomId: Int,
        itemId: Int,
        quantity: Double,
        remark: String?,
        parentItemId: Int?
    ): Result<Boolean>
}