package com.gmin.serverstandard.eaglered

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.IncomingInspectionDto
import com.gmin.serverstandard.adapter.`in`.web.dto.ProductionPerformanceDto
import com.gmin.serverstandard.adapter.`in`.web.dto.StockTransactionDto
import com.gmin.serverstandard.adapter.`in`.web.dto.WorkOrderDto
import com.gmin.serverstandard.adapter.`in`.web.dto.request.IncomingInspectionBulkRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.IncomingInspectionRequest
import java.math.BigDecimal
import com.gmin.serverstandard.application.port.`in`.command.ProductionPerformanceCommand
import com.gmin.serverstandard.common.config.FeignClientConfig
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestParam
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Date

@FeignClient(name = "eaglered", url = "\${eaglered.api.base-url}")
interface EagleRedFeignClient {

    // TODO 얘네들을 ResponseEntity<ApiResponse<T>> 로 반환값을 수정하기?

    @GetMapping("/api/v1/stock-transactions/{stockNumber}")
    fun getStockTransactions(
        @PathVariable("stockNumber") stockNumber: String
    ): ApiResponseDto<List<StockTransactionDto>>

    @GetMapping("/api/v1/stock-transactions/item/{itemCode}")
    fun getStockTransactionsByItemCode(
        @PathVariable("itemCode") itemCode: String
    ): ApiResponseDto<List<StockTransactionDto>>

    @GetMapping("/api/v1/stock-transactions/inventory/{itemCode}")
    fun getInventoryQuantityByItemCode(
        @PathVariable("itemCode") itemCode: String
    ): ApiResponseDto<BigDecimal>

    @GetMapping("/api/v1/purchase-order-in-item-check/date-range")
    fun getInspectionsByDateRange(
        @RequestParam("startDate") startDate: LocalDateTime,
        @RequestParam("endDate") endDate: LocalDateTime
    ): ApiResponseDto<List<IncomingInspectionDto>>

    @GetMapping("/api/v1/purchase-order-in-item-check/status")
    fun getInspectionsByApprovalStatus(
        @RequestParam("isApproved") isApproved: Boolean
    ): ApiResponseDto<List<IncomingInspectionDto>>

    @PutMapping("/api/v1/purchase-order-in-item-check/update")
    fun updateInspection(
        @RequestBody updateDto: IncomingInspectionRequest
    ): ApiResponseDto<IncomingInspectionDto>

    @PutMapping("/api/v1/purchase-order-in-item-check/update-bulk")
    fun updateInspections(
        @RequestBody updateBulkDto: IncomingInspectionBulkRequest
    ): ApiResponseDto<List<IncomingInspectionDto>>

    @PostMapping("/api/v1/production-performances")
    fun createProductionPerformance(
        @RequestBody productionPerformanceCommand: ProductionPerformanceCommand
    ): ApiResponseDto<ProductionPerformanceDto>

    @GetMapping("/api/v1/production-performances")
    fun getProductionPerformances(): ApiResponseDto<List<ProductionPerformanceDto>>

    @GetMapping("/api/v1/production-performances/{workOrderNo}/{workOrderSeq}")
    fun getProductionPerformanceById(
        @PathVariable("workOrderNo") workOrderNo: String,
        @PathVariable("workOrderSeq") workOrderSeq: Int,
    ): ApiResponseDto<List<ProductionPerformanceDto>>

    @GetMapping("/api/v1/work-orders")
    fun getWorkOrders(): ApiResponseDto<List<WorkOrderDto>>

    @GetMapping("/api/v1/work-orders/{workOrderNo}")
    fun getWorkOrderByNo(
        @PathVariable("workOrderNo") workOrderNo: String
    ): ApiResponseDto<List<WorkOrderDto>>

    @GetMapping("/api/v1/work-orders/date-range")
    fun getWorkOrdersByDateRange(
        @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate
    ): ApiResponseDto<List<WorkOrderDto>>

//    @GetMapping("/api/v1/bom/parts/{itemCd}")
//    fun getPartsByItemCode(
//        @PathVariable("itemCd") itemCd: String
//    ): ApiResponseDto<ItemPartListDto>
}
