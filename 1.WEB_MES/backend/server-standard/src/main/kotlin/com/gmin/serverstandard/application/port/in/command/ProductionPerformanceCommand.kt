package com.gmin.serverstandard.application.port.`in`.command

data class ProductionPerformanceCommand(
    val workOrderNumber: String,
    val workOrderSequence: Int,
    val memberCode: String,
    val itemCode: String,
    val goodQuantity: Int,
    val badQuantity: Int,
    val badType: String?,
    val badReason: String?,
    val note: String,
)
