package com.gmin.servereaglered.controller

import com.gmin.servereaglered.service.BomService
import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.ItemPartListDto
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.util.NoSuchElementException

@RestController
@RequestMapping("/api/v1/bom")
@Tag(name = "BOM", description = "BOM(Bill of Materials) API")
class BomController(
    private val bomService: BomService
) {
    @GetMapping("/parts/{itemCd}")
    @Operation(summary = "품목별 자재 코드 조회", description = "특정 품목 코드에 대한 모든 자재 코드, 소요량, 그리고 자재 보유량을 조회합니다. 소요량(quantity)은 완제품 한 개당 필요한 자재의 양을 나타냅니다. 자재 보유량(inventoryAmount)은 현재 해당 자재의 재고 수량을 나타냅니다.")
    fun getPartsByItemCode(
        @PathVariable itemCd: String
    ): ResponseEntity<ApiResponseDto<ItemPartListDto>> {
        try {
            val partsList = bomService.getPartsByItemCd(itemCd)
            return ResponseEntity.ok(
                ApiResponseDto.success(partsList, "자재 코드 목록, 소요량, 자재 보유량 조회가 성공적으로 완료되었습니다.")
            )
        } catch (e: NoSuchElementException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseDto.error("자재 코드 목록, 소요량, 자재 보유량 조회 실패: ${e.message}"))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error("자재 코드 목록, 소요량, 자재 보유량 조회 중 오류가 발생했습니다: ${e.message}"))
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
