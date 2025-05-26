package com.gmin.serverstandard.application.domain.model

import java.time.LocalDateTime

/**
 * BOM(Bill of Materials) 도메인 모델
 *
 * BOM의 기본 정보를 담고 있는 도메인 엔티티입니다.
 */
data class Bom(
    val bomId: Int,
    val bomStatus: String,
    val bomVersion: String,
    val remark: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        // BOM 상태 상수
        const val STATUS_TEMPORARY = "Draft"
        const val STATUS_INACTIVE = "Inactive"
        const val STATUS_ACTIVE = "Active"
        
        // BOM 상태 유효성 검사
        fun isValidBomStatus(bomStatus: String): Boolean {
            return bomStatus == STATUS_TEMPORARY || 
                   bomStatus == STATUS_INACTIVE || 
                   bomStatus == STATUS_ACTIVE
        }
    }
}