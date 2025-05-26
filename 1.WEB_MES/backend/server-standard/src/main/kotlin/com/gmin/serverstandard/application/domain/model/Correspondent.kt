package com.gmin.serverstandard.application.domain.model

import java.time.LocalDateTime

/**
 * 거래처 도메인 모델
 *
 * 거래처의 기본 정보를 담고 있는 도메인 엔티티입니다.
 */
data class Correspondent(
    val correspondentId: Int,
    val name: String,
    val type: String,
    val ceo: String,
    val businessNumber: String,
    val phoneNumber: String,
    val email: String,
    val address: String,
    val detailAddress: String,
    val note: String,
    val correspondentPhotoUri: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        // 거래처 타입 상수
        const val TYPE_PURCHASE = "매입"
        const val TYPE_SALE = "매출"
        const val TYPE_BOTH = "매출/매입"
        
        // 거래처 타입 유효성 검사
        fun isValidCorrespondentType(type: String): Boolean {
            return type == TYPE_PURCHASE || 
                   type == TYPE_SALE || 
                   type == TYPE_BOTH
        }
    }
}