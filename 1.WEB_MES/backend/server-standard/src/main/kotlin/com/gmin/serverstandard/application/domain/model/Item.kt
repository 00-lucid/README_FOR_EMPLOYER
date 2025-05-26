package com.gmin.serverstandard.application.domain.model

import java.time.LocalDateTime

/**
 * 품목 도메인 모델
 *
 * 품목의 기본 정보를 담고 있는 도메인 엔티티입니다.
 */
data class Item(
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
        // 품목 타입 상수
        const val TYPE_RAW_MATERIAL = "원자재"
        const val TYPE_SUB_MATERIAL = "부자재"
        const val TYPE_SEMI_PRODUCT = "반제품"
        const val TYPE_PRODUCT = "제품"
        
        // 품목 타입 유효성 검사
        fun isValidItemType(itemType: String): Boolean {
            return itemType == TYPE_RAW_MATERIAL || 
                   itemType == TYPE_SUB_MATERIAL || 
                   itemType == TYPE_SEMI_PRODUCT || 
                   itemType == TYPE_PRODUCT
        }
    }
}