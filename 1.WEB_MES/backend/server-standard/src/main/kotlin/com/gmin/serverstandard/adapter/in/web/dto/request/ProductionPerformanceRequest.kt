package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.ProductionPerformanceCommand

data class ProductionPerformanceRequest(
    val workOrderNumber: String,
    val workOrderSequence: Int,
    val memberCode: String,
    val itemCode: String,
    val goodQuantity: Int,
    val badQuantity: Int,
    val badType: String?,
    val badReason: String?,
    val note: String,
) {
    /**
     * LoginRequest를 LoginCommand로 변환하는 확장 함수
     */
    fun toCommand(): ProductionPerformanceCommand {
        return ProductionPerformanceCommand(
            workOrderNumber = this.workOrderNumber,
            workOrderSequence = this.workOrderSequence,
            memberCode = this.memberCode,
            itemCode = this.itemCode,
            goodQuantity = this.goodQuantity,
            badQuantity = this.badQuantity,
            badType = this.badType,
            badReason = this.badReason,
            note = this.note,
        )
    }
}
