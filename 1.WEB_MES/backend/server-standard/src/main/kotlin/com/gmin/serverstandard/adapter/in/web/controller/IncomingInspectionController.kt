package com.gmin.serverstandard.adapter.`in`.web.controller

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.IncomingInspectionDto
import com.gmin.serverstandard.adapter.`in`.web.dto.request.IncomingInspectionBulkRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.IncomingInspectionRequest
import com.gmin.serverstandard.eaglered.EagleRedFeignClient
import feign.FeignException
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Date

@RestController
@RequestMapping("/api/v1/incoming-inspections")
@Tag(name = "IncomingInspection", description = "입고 검사 API")
class IncomingInspectionController(
    private val eagleRedClient: EagleRedFeignClient
) {
    @GetMapping("/date-range")
    @Operation(summary = "기간별 입고 검사 조회", description = "지정된 기간 내의 입고 검사 내역을 조회합니다.")
    fun getIncomingInspectionsByDateRange(
        @RequestParam startDate: LocalDateTime,
        @RequestParam endDate: LocalDateTime
    ): ResponseEntity<ApiResponseDto<List<IncomingInspectionDto>>> {
        // EagleRed API 호출
        val response = eagleRedClient.getInspectionsByDateRange(startDate, endDate)

        // 응답 반환 (필요한 경우 변환 작업 수행)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/status")
    @Operation(summary = "승인 상태별 입고 검사 조회", description = "검사 합격 여부에 따른 입고 검사 내역을 조회합니다.")
    fun getIncomingInspectionsByApprovalStatus(
        @RequestParam isApproved: Boolean
    ): ResponseEntity<ApiResponseDto<List<IncomingInspectionDto>>> {
        // EagleRed API 호출
        val response = eagleRedClient.getInspectionsByApprovalStatus(isApproved)

        // 응답 반환 (필요한 경우 변환 작업 수행)
        return ResponseEntity.ok(response)
    }

    @PutMapping("/update")
    @Operation(summary = "단일 입고 검사 정보 업데이트", description = "단일 입고 검사의 검사일자, 검사자, 승인 여부를 업데이트합니다.")
    fun updateIncomingInspection(
        @RequestBody updateDto: IncomingInspectionRequest
    ): ResponseEntity<ApiResponseDto<IncomingInspectionDto>> {
        // EagleRed API 호출
        val response = eagleRedClient.updateInspection(updateDto)

        // 응답 반환
        return ResponseEntity.ok(response)
    }

    @PutMapping("/update-bulk")
    @Operation(summary = "다수 입고 검사 정보 업데이트", description = "여러 입고 검사의 검사일자, 검사자, 승인 여부를 일괄 업데이트합니다.")
    fun updateIncomingInspections(
        @RequestBody updateBulkDto: IncomingInspectionBulkRequest
    ): ResponseEntity<ApiResponseDto<List<IncomingInspectionDto>>> {
        // EagleRed API 호출
        val response = eagleRedClient.updateInspections(updateBulkDto)

        // 응답 반환
        return ResponseEntity.ok(response)
    }

    @ExceptionHandler(Exception::class)
    fun handleExceptions(e: Exception): ResponseEntity<ApiResponseDto<Nothing>> {
        val status = when (e) {
            is FeignException -> HttpStatus.valueOf(e.status())
            else -> HttpStatus.INTERNAL_SERVER_ERROR
        }

        return ResponseEntity
            .status(status)
            .body(ApiResponseDto.error("API 호출 중 오류 발생: ${e.message}"))
    }
}
