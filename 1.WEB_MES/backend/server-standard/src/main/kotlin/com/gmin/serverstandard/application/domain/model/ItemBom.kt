package com.gmin.serverstandard.application.domain.model

/**
 * 품목 BOM 도메인 모델
 *
 * 품목과 BOM의 관계 정보를 담고 있는 도메인 엔티티입니다.
 * 품목의 BOM 구조를 표현하며, 부모 품목과 자식 품목 간의 관계를 정의합니다.
 */
data class ItemBom(
    val bomId: Int,
    val itemId: Int,
    val quantity: Double,
    val remark: String?,
    val parentItemId: Int?
) {
    /**
     * 품목 BOM의 복합 키를 반환합니다.
     * 
     * @return 품목 ID와 BOM ID로 구성된 Pair
     */
    fun getCompositeKey(): Pair<Int, Int> {
        return Pair(itemId, bomId)
    }
}