package com.gmin.serverstandard.adapter.`in`.web.dto

import com.gmin.serverstandard.application.domain.model.Bom
import java.time.LocalDateTime

/**
 * BOM 데이터 전송 객체
 */
data class BomDto(
    val bomId: Int,
    val bomStatus: String,
    val bomVersion: String,
    val remark: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        /**
         * 도메인 엔티티를 DTO로 변환합니다.
         *
         * @param bom 도메인 엔티티
         * @return 변환된 DTO
         */
        fun fromDomain(bom: Bom): BomDto {
            return BomDto(
                bomId = bom.bomId,
                bomStatus = bom.bomStatus,
                bomVersion = bom.bomVersion,
                remark = bom.remark,
                createdAt = bom.createdAt,
                updatedAt = bom.updatedAt
            )
        }
    }
}