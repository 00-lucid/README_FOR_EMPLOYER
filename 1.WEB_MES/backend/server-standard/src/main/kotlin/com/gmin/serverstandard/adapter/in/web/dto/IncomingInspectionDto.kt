package com.gmin.serverstandard.adapter.`in`.web.dto

import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Date

/**
 * 입고 검사 DTO
 * 클라이언트와 통신할 때 사용하는 데이터 모델입니다.
 */
data class IncomingInspectionDto(
    // 회사 코드
    val compCd: String,

    /**
     * pOrderNo 같은 규칙성이 없는 단어 표현은 지양 해야 함
     */
    // 구매 주문 번호
    @JsonProperty("pOrderNo")
    val purchaseOrderNo: String,

    /**
     * pOrderSeq 같은 규칙성이 없는 단어 표현은 지양 해야 함
     */
    // 구매 주문 순번
    @JsonProperty("pOrderSeq")
    val purchaseOrderSeq: Int,

    // 구매 품목 명
    val itemCd: String,


    // 규격
    val std: String?,

    // 단위
    val unit: String?,

    // 발주 수량
    val ordQty: Int,

    // 발주 사람
    val ordPerson: String?,

    // 검사 일자
    val inspectionDate: LocalDateTime?,

    // 검사자
    val inspector: String?,

    // 비고
    val note: String?,

    // 검사 합격 여부
    val isApproved: Boolean,

    val inputDate: LocalDateTime,

    val inputUser: String,

    val badQty: Int,
)