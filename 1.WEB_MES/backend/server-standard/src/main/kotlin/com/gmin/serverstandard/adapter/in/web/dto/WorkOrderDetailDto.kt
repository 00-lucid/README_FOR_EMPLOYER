package com.gmin.serverstandard.adapter.`in`.web.dto

import java.util.Date

data class WorkOrderDetailDto(
    val workOrderSeq: Int,
    val startTime: Date?,
    val endTime: Date?,
    val memberCd: String,
    val processCd: String,
    val itemCd: String,
    val workQty: Int,
    val equiCd: String,
    val comYn: String,
)