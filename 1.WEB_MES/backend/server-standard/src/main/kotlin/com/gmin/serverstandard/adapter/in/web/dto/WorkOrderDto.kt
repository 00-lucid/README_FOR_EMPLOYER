package com.gmin.serverstandard.adapter.`in`.web.dto

import java.util.Date

data class WorkOrderDto(
    // master
    val prdReqNo: String,
    val prdPlanNo: String,
    val workOrderNo: String,
    val compCd: String,
    val workOrderDate: String,
    val lotSize: Int,
    val delYn: String,
    val inputDate: Date,
    val inputUser: String,

    // detail
    val details: List<WorkOrderDetailDto>
)
