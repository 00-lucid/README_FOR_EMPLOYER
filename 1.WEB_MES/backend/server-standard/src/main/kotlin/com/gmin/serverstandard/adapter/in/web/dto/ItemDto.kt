package com.gmin.serverstandard.adapter.`in`.web.dto

import com.gmin.serverstandard.application.domain.model.Item
import java.time.LocalDateTime

/**
 * 품목 정보를 클라이언트에 전달하기 위한 DTO 클래스
 *
 * 품목의 모든 필요한 정보를 클라이언트에 제공합니다.
 */
data class ItemDto(
    val itemId: Int,
    val itemName: String,
    val itemType: String,
    val unit: String,
    val salePrice: Double,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val itemPhotoUri: String?,
    val companyId: Int
) {
    companion object {
        /**
         * 도메인 엔티티인 Item을 ItemDto로 변환합니다.
         *
         * @param item 변환할 도메인 엔티티
         * @return 생성된 ItemDto 객체
         */
        fun fromDomain(item: Item): ItemDto {
            return ItemDto(
                itemId = item.itemId,
                itemName = item.itemName,
                itemType = item.itemType,
                unit = item.unit,
                salePrice = item.salePrice,
                createdAt = item.createdAt,
                updatedAt = item.updatedAt,
                itemPhotoUri = item.itemPhotoUri,
                companyId = item.companyId
            )
        }
    }
}