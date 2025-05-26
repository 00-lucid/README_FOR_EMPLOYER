package com.gmin.serverstandard.adapter.`in`.web.controller

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.WorkOrderDto
import com.gmin.serverstandard.eaglered.EagleRedFeignClient
import feign.FeignException
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate

@RestController
@RequestMapping("/api/v1/work-orders")
@Tag(name = "WorkOrder", description = "작업지시 API")
class WorkOrderController(
    private val eagleRedClient: EagleRedFeignClient
) {
    @GetMapping
    @Operation(summary = "작업지시 목록 조회", description = "모든 작업지시를 조회합니다.")
    fun getWorkOrders(): ResponseEntity<ApiResponseDto<List<WorkOrderDto>>> {
        // EagleRed API 호출
        val response = eagleRedClient.getWorkOrders()

        // 응답 반환
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{workOrderNo}")
    @Operation(summary = "작업지시 상세 조회", description = "특정 작업지시번호의 작업지시를 조회합니다.")
    fun getWorkOrderByNo(
        @PathVariable workOrderNo: String
    ): ResponseEntity<ApiResponseDto<List<WorkOrderDto>>> {
        // EagleRed API 호출
        val response = eagleRedClient.getWorkOrderByNo(workOrderNo)

        // 응답 반환
        return ResponseEntity.ok(response)
    }

    @GetMapping("/date-range")
    @Operation(summary = "기간별 작업지시 조회", description = "지정된 기간 내의 작업지시 내역을 조회합니다.")
    fun getWorkOrdersByDateRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) startDate: LocalDate,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) endDate: LocalDate
    ): ResponseEntity<ApiResponseDto<List<WorkOrderDto>>> {
        // EagleRed API 호출
        val response = eagleRedClient.getWorkOrdersByDateRange(startDate, endDate)

        // 응답 반환
        return ResponseEntity.ok(response)
    }

    @ExceptionHandler(Exception::class)
    fun handleExceptions(e: Exception): ResponseEntity<ApiResponseDto<Nothing>> {
        val status = when (e) {
            is FeignException -> HttpStatus.valueOf(e.status())
            is IllegalArgumentException -> HttpStatus.BAD_REQUEST
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }

        val message = when (e) {
            is FeignException.NotFound -> "작업지시를 찾을 수 없습니다: ${e.message}"
            is IllegalArgumentException -> "입력 데이터 검증 오류: ${e.message}"
            else -> "API 호출 중 오류 발생: ${e.message}"
        }

        return ResponseEntity
            .status(status)
            .body(ApiResponseDto.error(message))
    }
}
