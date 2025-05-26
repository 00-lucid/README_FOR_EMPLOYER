package com.gmin.servereaglered.controller

import com.gmin.servereaglered.service.PurchaseOrderInItemCheckService
import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.IncomingInspectionDto
import com.gmin.serverstandard.adapter.`in`.web.dto.request.IncomingInspectionBulkRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.IncomingInspectionRequest
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Date

@RestController
@RequestMapping("/api/v1/purchase-order-in-item-check")
@Tag(name = "PurchaseOrderInItemCheck", description = "수입검사 API")
class PurchaseOrderInItemCheckController(
    private val purchaseOrderInItemCheckService: PurchaseOrderInItemCheckService
) {
    @GetMapping("/date-range")
    @Operation(summary = "기간별 입고 검사 조회", description = "지정된 기간 내의 입고 검사 내역을 조회합니다.")
    fun getIncomingInspectionsByDateRange(
        @RequestParam endDate: LocalDateTime,
        @RequestParam startDate: LocalDateTime
    ): ResponseEntity<ApiResponseDto<List<IncomingInspectionDto>>> {
        val purchaseOrderInItemChecks = purchaseOrderInItemCheckService.getPurchaseOrderInItemCheckByDateBetween(startDate, endDate)
        // 엔티티의 toDto() 메서드를 사용하여 DTO로 변환
        val dtoList = purchaseOrderInItemChecks.map { it.toDto() }

        return ResponseEntity.ok(
            ApiResponseDto.success(dtoList, "기간별 입고 검사 조회가 성공적으로 완료되었습니다.")
        )
    }

    @GetMapping("/status")
    @Operation(summary = "승인 상태별 입고 검사 조회", description = "검사 합격 여부에 따른 입고 검사 내역을 조회합니다.")
    fun getIncomingInspectionsByApprovalStatus(
        @RequestParam isApproved: Boolean
    ): ResponseEntity<ApiResponseDto<List<IncomingInspectionDto>>> {
        val purchaseOrderInItemChecks = purchaseOrderInItemCheckService.getPurchaseOrderInItemCheckByIsApproved(isApproved)
        // 엔티티의 toDto() 메서드를 사용하여 DTO로 변환
        val dtoList = purchaseOrderInItemChecks.map { it.toDto() }

        return ResponseEntity.ok(
            ApiResponseDto.success(dtoList, "승인 상태별 입고 검사 조회가 성공적으로 완료되었습니다.")
        )
    }

    @PutMapping("/update")
    @Operation(summary = "단일 입고 검사 정보 업데이트", description = "단일 입고 검사의 검사일자, 검사자, 승인 여부를 업데이트합니다.")
    fun updateIncomingInspection(
        @RequestBody updateDto: IncomingInspectionRequest
    ): ResponseEntity<ApiResponseDto<IncomingInspectionDto>> {
        val updatedEntity = purchaseOrderInItemCheckService.updatePurchaseOrderInItemCheck(updateDto)
            ?: return ResponseEntity.badRequest().body(
                ApiResponseDto.error("해당 입고 검사 정보를 찾을 수 없습니다.")
            )

        return ResponseEntity.ok(
            ApiResponseDto.success(updatedEntity.toDto(), "입고 검사 정보가 성공적으로 업데이트되었습니다.")
        )
    }

    @PutMapping("/update-bulk")
    @Operation(summary = "다수 입고 검사 정보 업데이트", description = "여러 입고 검사의 검사일자, 검사자, 승인 여부를 일괄 업데이트합니다.")
    fun updateIncomingInspections(
        @RequestBody updateBulkDto: IncomingInspectionBulkRequest
    ): ResponseEntity<ApiResponseDto<List<IncomingInspectionDto>>> {
        val updatedEntities = purchaseOrderInItemCheckService.updatePurchaseOrderInItemChecks(updateBulkDto.items)

        if (updatedEntities.isEmpty()) {
            return ResponseEntity.badRequest().body(
                ApiResponseDto.error("업데이트할 입고 검사 정보를 찾을 수 없습니다.")
            )
        }

        // 엔티티의 toDto() 메서드를 사용하여 DTO로 변환
        val dtoList = updatedEntities.map { it.toDto() }

        return ResponseEntity.ok(
            ApiResponseDto.success(dtoList, "입고 검사 정보가 성공적으로 일괄 업데이트되었습니다.")
        )
    }
}
