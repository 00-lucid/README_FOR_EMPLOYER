package com.gmin.servereaglered.controller

import com.gmin.servereaglered.service.StockTransactionService
import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.StockTransactionDto
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.util.NoSuchElementException

@RestController
@RequestMapping("/api/v1/stock-transactions")
@Tag(name = "StockTransaction", description = "재고 이동 API")
class StockTransactionController(
    private val stockTransactionService: StockTransactionService
) {
    @GetMapping("{stkNo}")
    @Operation(summary = "재고 이동 조회", description = "재고 이동 정보를 조회합니다.")
    fun getStockTransactionsByWorkOrder(
        @PathVariable stkNo: String
    ): ResponseEntity<ApiResponseDto<List<StockTransactionDto>>> {
        try {
            val stockTransactions = stockTransactionService.getStockTransactions(stkNo)
            return ResponseEntity.ok(
                ApiResponseDto.success(stockTransactions, "Stock transactions retrieved successfully")
            )
        } catch (e: NoSuchElementException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseDto.error(e.message ?: "Stock transactions not found"))
        }
    }

    @GetMapping("/item/{itemCode}")
    @Operation(summary = "품목별 재고 이동 조회", description = "특정 품목 코드에 대한 모든 재고 이동 정보를 조회합니다.")
    fun getStockTransactionsByItemCode(
        @PathVariable itemCode: String
    ): ResponseEntity<ApiResponseDto<List<StockTransactionDto>>> {
        try {
            val stockTransactions = stockTransactionService.getStockTransactionsByItemCode(itemCode)
            return ResponseEntity.ok(
                ApiResponseDto.success(stockTransactions, "Stock transactions for item code retrieved successfully")
            )
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("Error retrieving stock transactions: ${e.message}"))
        }
    }

    @GetMapping("/inventory/{itemCode}")
    @Operation(summary = "품목별 재고 수량 조회", description = "특정 품목 코드에 대한 총 재고 수량을 조회합니다.")
    fun getInventoryQuantityByItemCode(
        @PathVariable itemCode: String
    ): ResponseEntity<ApiResponseDto<BigDecimal>> {
        try {
            val inventoryQuantity = stockTransactionService.getInventoryQuantityByItemCode(itemCode)
            return ResponseEntity.ok(
                ApiResponseDto.success(inventoryQuantity, "재고 수량 조회가 성공적으로 완료되었습니다.")
            )
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("재고 수량 조회 중 오류가 발생했습니다: ${e.message}"))
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
            is NoSuchElementException -> "Resource not found: ${e.message}"
            is IllegalArgumentException -> "Invalid input: ${e.message}"
            else -> "Error occurred: ${e.message}"
        }

        return ResponseEntity
            .status(status)
            .body(ApiResponseDto.error(message))
    }
}
