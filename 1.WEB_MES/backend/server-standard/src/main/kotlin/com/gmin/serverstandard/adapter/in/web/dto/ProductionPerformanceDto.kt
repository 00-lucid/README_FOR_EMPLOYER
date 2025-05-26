package com.gmin.serverstandard.adapter.`in`.web.dto

import java.time.LocalDateTime
import java.util.Date

data class ProductionPerformanceDto(
    val workOrderNo: String,
    val workOrderSeq: String,
    val perfromNo: String,
    val compCd: String,
    val lotNo: String,
    val memberCd: String,
    val workDate: Date,
    val itemCd: String,
    val makeQty: Int,
    val makeOkQty: Int,
    val makeBadQty: Int,
    val badType: String? = null,
    val badReason: String? = null,
    val stkNo: String? = null,
    val remk: String? = null,
    val delYn: String? = null,
    val inputDate: String? = null,
    val inputUser: String? = null
)
