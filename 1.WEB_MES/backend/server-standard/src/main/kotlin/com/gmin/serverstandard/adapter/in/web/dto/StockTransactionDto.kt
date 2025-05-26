package com.gmin.serverstandard.adapter.`in`.web.dto

import java.math.BigDecimal
import java.util.Date

/**
 * 재고 이동 상세 정보 DTO
 */
data class StockTransDetailDto(
    val stkNo: String,
    val stkSeq: Int,
    val compCd: String,
    val itemCd: String,
    val transQty: BigDecimal,
    val delYn: String,
    val inputDate: Date,
    val inputUser: String
)

/**
 * 재고 이동 마스터 정보와 상세 정보를 포함하는 DTO
 */
data class StockTransactionDto(
    // 마스터 정보
    val stkNo: String,
    val compCd: String,
    val stkDate: String,
    val stkType: String,
    val warehouseCd: String,
    val remk: String?,
    val delYn: String,
    val inputDate: Date,
    val inputUser: String,
    
    // 상세 정보 목록
    val details: List<StockTransDetailDto>
)