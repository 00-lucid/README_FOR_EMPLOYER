package com.gmin.servereaglered.controller

import com.gmin.servereaglered.service.WorkOrderService
import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.WorkOrderDto
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.util.NoSuchElementException

@RestController
@RequestMapping("/api/v1/work-orders")
@Tag(name = "WorkOrder", description = "작업지시 API")
class WorkOrderController(
    private val workOrderService: WorkOrderService
) {
    @GetMapping
    @Operation(summary = "작업지시 목록 조회", description = "모든 작업지시를 조회합니다.")
    fun getWorkOrders(): ResponseEntity<ApiResponseDto<List<WorkOrderDto>>> {
        val workOrders = workOrderService.getAllWorkOrders()
        return ResponseEntity.ok(
            ApiResponseDto.success(workOrders, "작업지시 목록 조회가 성공적으로 완료되었습니다.")
        )
    }

    @GetMapping("/{workOrderNo}")
    @Operation(summary = "작업지시 상세 조회", description = "특정 작업지시번호의 작업지시를 조회합니다.")
    fun getWorkOrderByNo(
        @PathVariable workOrderNo: String
    ): ResponseEntity<ApiResponseDto<List<WorkOrderDto>>> {
        try {
            val workOrders = workOrderService.getWorkOrderByNo(workOrderNo)
            return ResponseEntity.ok(
                ApiResponseDto.success(workOrders, "작업지시 상세 조회가 성공적으로 완료되었습니다.")
            )
        } catch (e: NoSuchElementException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseDto.error(e.message ?: "작업지시를 찾을 수 없습니다."))
        }
    }

    @GetMapping("/date-range")
    @Operation(summary = "기간별 작업지시 조회", description = "지정된 기간 내의 작업지시를 조회합니다.")
    fun getWorkOrdersByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate
    ): ResponseEntity<ApiResponseDto<List<WorkOrderDto>>> {
        try {
            val workOrders = workOrderService.getWorkOrdersByDateRange(startDate, endDate)
            return ResponseEntity.ok(
                ApiResponseDto.success(workOrders, "기간별 작업지시 조회가 성공적으로 완료되었습니다.")
            )
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("기간별 작업지시 조회 중 오류가 발생했습니다: ${e.message}"))
        }
    }

    @ExceptionHandler(Exception::class)
    fun handleExceptions(e: Exception): ResponseEntity<ApiResponseDto<Nothing>> {
        val status = when (e) {
            is NoSuchElementException -> HttpStatus.NOT_FOUND
            is IllegalArgumentException -> HttpStatus.BAD_REQUEST
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }

        val message = when (e) {
            is NoSuchElementException -> "작업지시를 찾을 수 없습니다: ${e.message}"
            is IllegalArgumentException -> "입력 데이터 검증 오류: ${e.message}"
            else -> "API 호출 중 오류 발생: ${e.message}"
        }

        return ResponseEntity
            .status(status)
            .body(ApiResponseDto.error(message))
    }
}
