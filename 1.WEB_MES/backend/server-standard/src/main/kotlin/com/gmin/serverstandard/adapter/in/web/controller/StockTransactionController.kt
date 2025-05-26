package com.gmin.serverstandard.adapter.`in`.web.controller

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.StockTransactionDto
import com.gmin.serverstandard.eaglered.EagleRedFeignClient
import feign.FeignException
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/v1/stock-transactions")
@Tag(name = "StockTransaction", description = "재고 이동 API")
class StockTransactionController(
    private val eagleRedClient: EagleRedFeignClient
) {
    @GetMapping("/{stockNumber}")
    @Operation(summary = "재고 이동 조회", description = "재고 이동 정보를 조회합니다.")
    fun getStockTransactions(
        @PathVariable stockNumber: String
    ): ResponseEntity<ApiResponseDto<List<StockTransactionDto>>> {
        // EagleRed API 호출
        val response = eagleRedClient.getStockTransactions(stockNumber)

        // 응답 반환
        return ResponseEntity.ok(response)
    }

    @GetMapping("/item/{itemCode}")
    @Operation(summary = "품목별 재고 이동 조회", description = "특정 품목 코드에 대한 모든 재고 이동 정보를 조회합니다.")
    fun getStockTransactionsByItemCode(
        @PathVariable itemCode: String
    ): ResponseEntity<ApiResponseDto<List<StockTransactionDto>>> {
        // EagleRed API 호출
        val response = eagleRedClient.getStockTransactionsByItemCode(itemCode)

        // 응답 반환
        return ResponseEntity.ok(response)
    }

    @GetMapping("/inventory/{itemCode}")
    @Operation(summary = "품목별 재고 수량 조회", description = "특정 품목 코드에 대한 총 재고 수량을 조회합니다.")
    fun getInventoryQuantityByItemCode(
        @PathVariable itemCode: String
    ): ResponseEntity<ApiResponseDto<BigDecimal>> {
        // EagleRed API 호출
        val response = eagleRedClient.getInventoryQuantityByItemCode(itemCode)

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
            is FeignException.NotFound -> "Stock transactions not found: ${e.message}"
            is IllegalArgumentException -> "Invalid input: ${e.message}"
            else -> "Error occurred: ${e.message}"
        }

        return ResponseEntity
            .status(status)
            .body(ApiResponseDto.error(message))
    }
}
