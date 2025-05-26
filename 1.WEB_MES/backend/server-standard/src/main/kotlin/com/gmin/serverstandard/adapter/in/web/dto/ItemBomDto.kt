package com.gmin.serverstandard.adapter.`in`.web.dto

import com.gmin.serverstandard.application.domain.model.ItemBom
import com.gmin.serverstandard.application.port.`in`.GetBomUseCase

/**
 * 품목 BOM 데이터 전송 객체
 */
data class ItemBomDto(
    val bomId: Int,
    val itemId: Int,
    val quantity: Double,
    val remark: String?,
    val parentItemId: Int?,
    val item: ItemDto? = null,
    val parentItem: ItemDto? = null
) {
    companion object {
        /**
         * 도메인 엔티티를 DTO로 변환합니다.
         *
         * @param itemBom 도메인 엔티티
         * @return 변환된 DTO
         */
        fun fromDomain(itemBom: ItemBom): ItemBomDto {
            return ItemBomDto(
                bomId = itemBom.bomId,
                itemId = itemBom.itemId,
                quantity = itemBom.quantity,
                remark = itemBom.remark,
                parentItemId = itemBom.parentItemId
            )
        }
    }
}

/**
 * 품목 BOM 트리 노드 데이터 전송 객체
 */
data class ItemBomTreeDto(
    val itemBom: ItemBomDto,
    val children: List<ItemBomTreeDto> = emptyList()
) {
    companion object {
        /**
         * 도메인 트리 노드를 DTO로 변환합니다.
         *
         * @param treeNode 도메인 트리 노드
         * @return 변환된 DTO
         */
        fun fromDomain(treeNode: GetBomUseCase.ItemBomTreeNode): ItemBomTreeDto {
            return ItemBomTreeDto(
                itemBom = ItemBomDto.fromDomain(treeNode.itemBom),
                children = treeNode.children.map { fromDomain(it) }
            )
        }
    }
}