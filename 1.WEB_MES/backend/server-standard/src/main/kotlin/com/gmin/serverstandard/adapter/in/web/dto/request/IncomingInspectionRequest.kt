package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

/**
 * 입고 검사 업데이트 DTO
 * 입고 검사 정보를 업데이트할 때 사용하는 데이터 모델입니다.
 */
data class IncomingInspectionRequest(
    // 구매 주문 번호
    @JsonProperty("pOrderNo")
    val purchaseOrderNo: String,

    // 구매 주문 순번
    @JsonProperty("pOrderSeq")
    val purchaseOrderSeq: Int,

    // 검사자
    val inspector: String?,

    // 검사 합격 여부
    val isApproved: Boolean
)

/**
 * 다수의 입고 검사 업데이트 DTO
 * 여러 입고 검사 정보를 한 번에 업데이트할 때 사용하는 데이터 모델입니다.
 */
data class IncomingInspectionBulkRequest(
    val items: List<IncomingInspectionRequest>
)