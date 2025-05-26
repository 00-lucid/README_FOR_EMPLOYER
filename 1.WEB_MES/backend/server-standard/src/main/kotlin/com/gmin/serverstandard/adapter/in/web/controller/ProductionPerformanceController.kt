package com.gmin.serverstandard.adapter.`in`.web.controller

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.ProductionPerformanceDto
import com.gmin.serverstandard.adapter.`in`.web.dto.request.ProductionPerformanceRequest
import com.gmin.serverstandard.eaglered.EagleRedFeignClient
import feign.FeignException
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/v1/production-performances")
@Tag(name = "ProductionPerformance", description = "생산 실적 API")
class ProductionPerformanceController(
    private val eagleRedClient: EagleRedFeignClient
) {
    @PostMapping
    @Operation(summary = "생산 실적 등록", description = "신규 생산 실적을 등록합니다.")
    fun createProductionPerformance(
        @RequestBody productionPerformanceRequest: ProductionPerformanceRequest
    ): ResponseEntity<ApiResponseDto<ProductionPerformanceDto>> {
        val command = productionPerformanceRequest.toCommand()
        try {
            // TODO 재고 부족일 때 response를 가져오지 못함 (다른 에러가 발생함).
            // 생산 실적 등록 진행 (재고 검증은 EagleRed 서버에서 수행)
            val response = eagleRedClient.createProductionPerformance(command)

            // 응답 반환
            return ResponseEntity.status(HttpStatus.CREATED).body(response)
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponseDto.error("생산 실적 등록 중 오류가 발생했습니다: ${e.message}")
            )
        }
    }

    @GetMapping
    @Operation(summary = "생산 실적 목록 조회", description = "모든 생산 실적을 조회합니다.")
    fun getProductionPerformances(): ResponseEntity<ApiResponseDto<List<ProductionPerformanceDto>>> {
        // EagleRed API 호출
        val response = eagleRedClient.getProductionPerformances()

        // 응답 반환
        return ResponseEntity.ok(response)
    }

    @GetMapping("/{workOrderNo}/{workOrderSeq}")
    @Operation(summary = "생산 실적 상세 조회", description = "작업지시의 특정 공정 생산 실적을 조회합니다.")
    fun getProductionPerformanceById(
        @PathVariable workOrderNo: String,
        @PathVariable workOrderSeq: Int
    ): ResponseEntity<ApiResponseDto<List<ProductionPerformanceDto>>> {
        // EagleRed API 호출
        val response = eagleRedClient.getProductionPerformanceById(workOrderNo, workOrderSeq)

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
            is IllegalArgumentException -> "입력 데이터 검증 오류: ${e.message}"
            else -> "API 호출 중 오류 발생: ${e.message}"
        }

        return ResponseEntity
            .status(status)
            .body(ApiResponseDto.error(message))
    }
}
