package com.gmin.servereaglered.controller

import com.gmin.servereaglered.model.ProductionPerformanceId
import com.gmin.servereaglered.model.StockTransDetailEntity
import com.gmin.servereaglered.model.StockTransDetailId
import com.gmin.servereaglered.model.StockTransMasterEntity
import com.gmin.servereaglered.model.StockTransMasterId
import com.gmin.servereaglered.model.WorkOrderDetailEntity
import com.gmin.servereaglered.model.WorkOrderDetailId
import com.gmin.servereaglered.repository.StockTransDetailRepository
import com.gmin.servereaglered.repository.StockTransMasterRepository
import com.gmin.servereaglered.repository.WorkOrderDetailRepository
import com.gmin.servereaglered.service.BomService
import com.gmin.servereaglered.service.FactOutItemInfoService
import com.gmin.servereaglered.service.ProductionPerformanceService
import com.gmin.servereaglered.service.StockTransactionService
import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.PartInfoDto
import com.gmin.serverstandard.adapter.`in`.web.dto.ProductionPerformanceDto
import com.gmin.serverstandard.application.port.`in`.command.ProductionPerformanceCommand
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.util.NoSuchElementException

@RestController
@RequestMapping("/api/v1/production-performances")
@Tag(name = "ProductionPerformance", description = "생산 실적 API")
class ProductionPerformanceController(
    private val productionPerformanceService: ProductionPerformanceService,
    private val stockTransactionService: StockTransactionService,
    private val bomService: BomService,
    private val workOrderDetailRepository: WorkOrderDetailRepository,
    private val factOutItemInfoService: FactOutItemInfoService
) {
    @GetMapping
    @Operation(summary = "생산 실적 목록 조회", description = "모든 생산 실적을 조회합니다.")
    fun getProductionPerformances(): ResponseEntity<ApiResponseDto<List<ProductionPerformanceDto>>> {
        val productionPerformances = productionPerformanceService.getAllProductionPerformances()
        // 엔티티의 toDto() 메서드를 사용하여 DTO로 변환
        val dtoList = productionPerformances.map { it.toDto() }

        return ResponseEntity.ok(
            ApiResponseDto.success(dtoList, "생산 실적 목록 조회가 성공적으로 완료되었습니다.")
        )
    }

    @GetMapping("/{workOrderNo}/{workOrderSeq}")
    @Operation(summary = "생산 실적 상세 조회", description = "작업지시의 특정 공정 생산 실적을 조회합니다.")
    fun getProductionPerformanceById(
        @PathVariable workOrderNo: String,
        @PathVariable workOrderSeq: Int
    ): ResponseEntity<ApiResponseDto<List<ProductionPerformanceDto>>> {
        try {
            val productionPerformances = productionPerformanceService.getProductionPerformanceById(workOrderNo, workOrderSeq)
            // 엔티티 리스트를 DTO 리스트로 변환
            val dtoList = productionPerformances.map { it.toDto() }

            return ResponseEntity.ok(
                ApiResponseDto.success(dtoList, "생산 실적 상세 조회가 성공적으로 완료되었습니다.")
            )
        } catch (e: NoSuchElementException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponseDto.error(e.message ?: "생산 실적을 찾을 수 없습니다."))
        }
    }

    @PostMapping
    @Operation(summary = "생산 실적 등록", description = "신규 생산 실적을 등록합니다.")
    @Transactional
    fun createProductionPerformance(
        @RequestBody productionPerformanceCommand: ProductionPerformanceCommand
    ): ResponseEntity<ApiResponseDto<ProductionPerformanceDto?>> {
        try {
            // 양품 + 불량품 수량
            val totalProductionQuantity = BigDecimal.valueOf(
                (productionPerformanceCommand.goodQuantity + productionPerformanceCommand.badQuantity).toLong()
            )

            // WorkOrderDetail 조회
            val workOrderDetailId = WorkOrderDetailId(
                workOrderNo = productionPerformanceCommand.workOrderNumber,
                workOrderSeq = productionPerformanceCommand.workOrderSequence.toString()
            )

            val workOrderDetail = workOrderDetailRepository.findById(workOrderDetailId)
                .orElseThrow { NoSuchElementException("해당 작업지시를 찾을 수 없습니다.") }

            // 생산 수량이 작업지시 수량을 초과하는지 확인
            val workQty = workOrderDetail.workQty
            val totalProductionQty = productionPerformanceCommand.goodQuantity + productionPerformanceCommand.badQuantity

            // 이전 생산량 조회
            val previousProductionQty = productionPerformanceService.getPreviousProductionQuantity(
                productionPerformanceCommand.workOrderNumber,
                productionPerformanceCommand.workOrderSequence
            )

            // 현재 양품 수량 + 이전 양품 수량이 작업지시 수량을 초과하는지 확인
            if (productionPerformanceCommand.goodQuantity + previousProductionQty > workQty) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponseDto.error("지시 수량을 초과하는 생산 수량은 추가 작업지시를 등록 후 생산 등록 해주세요.")
                )
            }

            // 만약 최초 공정이면 자재 재고 부족 검증
            if (productionPerformanceCommand.workOrderSequence == 1) {
                // BOM 정보 조회: 생산할 아이템에 필요한 자재 목록과 소요량 조회
                val itemPartList = bomService.getPartsByItemCd(productionPerformanceCommand.itemCode)

                // 부족한 자재 목록
                val insufficientMaterials = mutableListOf<PartInfoDto>()

                // 각 자재별로 필요 수량 계산 및 재고 확인
                itemPartList.parts.forEach { partInfo ->
                    // 필요한 자재 수량 = 자재 소요량 * 생산 수량
                    val requiredQuantity = partInfo.quantity.multiply(totalProductionQuantity)

                    // 재고가 필요 수량보다 적으면 부족한 자재 목록에 추가
                    if (partInfo.inventoryAmount.compareTo(requiredQuantity) < 0) {
                        // 부족량 계산
                        val shortageAmount = requiredQuantity.subtract(partInfo.inventoryAmount)

                        // 부족한 자재 정보 생성 (quantity 필드에 부족량 저장)
                        val insufficientMaterial = PartInfoDto(
                            partCd = partInfo.partCd,
                            quantity = shortageAmount,
                            inventoryAmount = partInfo.inventoryAmount
                        )

                        insufficientMaterials.add(insufficientMaterial)
                    }
                }

                // 부족한 자재가 있으면 오류 응답 반환
                if (insufficientMaterials.isNotEmpty()) {
                    // 부족한 자재 정보를 문자열로 변환
                    val shortageInfo = insufficientMaterials.joinToString(", ") { 
                        "자재코드: ${it.partCd}, 현재 재고: ${it.inventoryAmount}, 부족량: ${it.quantity}" 
                    }

                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                        ApiResponseDto.success(null, "자재 재고가 부족하여 생산실적을 등록할 수 없습니다. $shortageInfo")
                    )
                }
            }

            // 재고가 충분하면 생산 실적 등록 진행
            val createdPerformance = productionPerformanceService.createProductionPerformance(productionPerformanceCommand)

            // 최초 공정인 경우 사용된 자재를 출고 처리
            if (productionPerformanceCommand.workOrderSequence == 1) {
                // BOM 정보 조회: 생산할 아이템에 필요한 자재 목록과 소요량 조회
                val itemPartList = bomService.getPartsByItemCd(productionPerformanceCommand.itemCode)

                // 각 자재별로 출고 처리
                itemPartList.parts.forEach { partInfo ->
                    // 필요한 자재 수량 = 자재 소요량 * 생산 수량
                    val requiredQuantity = partInfo.quantity.multiply(totalProductionQuantity)

                    // 자재 출고 등록
                    val factOutItemInfo = factOutItemInfoService.addFactOutItemInfo(
                        workOrderNo = productionPerformanceCommand.workOrderNumber,
                        workOrderSeq = productionPerformanceCommand.workOrderSequence,
                        outItemCd = partInfo.partCd,
                        outQty = requiredQuantity,
                        performNo = createdPerformance.id.performNo,
                        remk = "생산 실적 등록에 따른 자재 자동 출고",
                        inputUser = productionPerformanceCommand.memberCode
                    )

                    // 재고 이동 정보 생성 (StockTransMaster, StockTransDetail)
                    stockTransactionService.createMaterialOutStockTransaction(
                        stkNo = factOutItemInfo.stkNo,
                        itemCd = partInfo.partCd,
                        transQty = requiredQuantity,
                        inputUser = productionPerformanceCommand.memberCode
                    )
                }
            }

            // 현재 공정이 최종 공정인지 확인
            val workOrderDetails = workOrderDetailRepository.findByIdWorkOrderNo(productionPerformanceCommand.workOrderNumber)
            val maxWorkOrderSeq = workOrderDetails.maxOfOrNull { it.id.workOrderSeq.toInt() } ?: 0
            val isLastProcess = productionPerformanceCommand.workOrderSequence == maxWorkOrderSeq

            // 최종 공정인 경우 생산 입고 처리
            if (isLastProcess) {
                // 생산 입고를 위한 StkNo 생성 (FactOutItemInfoService의 generateNextStkNo 메서드와 유사한 로직)
                val stkNo = factOutItemInfoService.addFactOutItemInfo(
                    workOrderNo = productionPerformanceCommand.workOrderNumber,
                    workOrderSeq = productionPerformanceCommand.workOrderSequence,
                    outItemCd = productionPerformanceCommand.itemCode,
                    outQty = totalProductionQuantity,
                    performNo = createdPerformance.id.performNo,
                    remk = "생산 실적 등록에 따른 생산품 자동 입고",
                    inputUser = productionPerformanceCommand.memberCode
                ).stkNo

                // 생산 입고 등록 (StockTransMaster, StockTransDetail)
                stockTransactionService.createProductionInStockTransaction(
                    stkNo = stkNo,
                    itemCd = productionPerformanceCommand.itemCode,
                    transQty = totalProductionQuantity,
                    inputUser = productionPerformanceCommand.memberCode
                )

                // 생산실적에 StkNo 업데이트
                productionPerformanceService.updateStkNo(
                    workOrderNo = productionPerformanceCommand.workOrderNumber,
                    workOrderSeq = productionPerformanceCommand.workOrderSequence,
                    performNo = createdPerformance.id.performNo,
                    stkNo = stkNo
                )
            }

            // 현재 양품 수량 + 이전 양품 수량이 작업지시 수량과 같으면 ComYn을 'Y'로 업데이트
            if (productionPerformanceCommand.goodQuantity + previousProductionQty == workQty) {
                // WorkOrderDetailEntity는 불변이므로 새 엔티티를 생성하여 저장
                val updatedWorkOrderDetail = WorkOrderDetailEntity(
                    id = workOrderDetail.id,
                    compCd = workOrderDetail.compCd,
                    startTime = workOrderDetail.startTime,
                    endTime = workOrderDetail.endTime,
                    memberCd = workOrderDetail.memberCd,
                    processCd = workOrderDetail.processCd,
                    itemCd = workOrderDetail.itemCd,
                    workQty = workOrderDetail.workQty,
                    equiCd = workOrderDetail.equiCd,
                    comYn = "Y",  // 여기서 ComYn을 'Y'로 설정
                    delYn = workOrderDetail.delYn,
                    inputDate = workOrderDetail.inputDate,
                    inputUser = workOrderDetail.inputUser
                )
                workOrderDetailRepository.save(updatedWorkOrderDetail)
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponseDto.success(createdPerformance.toDto(), "생산 실적이 성공적으로 등록되었습니다."))
        } catch (e: Exception) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error("생산 실적 등록 중 오류가 발생했습니다: ${e.message}"))
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
            is NoSuchElementException -> "생산 실적을 찾을 수 없습니다: ${e.message}"
            is IllegalArgumentException -> "입력 데이터 검증 오류: ${e.message}"
            else -> "API 호출 중 오류 발생: ${e.message}"
        }

        return ResponseEntity
            .status(status)
            .body(ApiResponseDto.error(message))
    }
}
