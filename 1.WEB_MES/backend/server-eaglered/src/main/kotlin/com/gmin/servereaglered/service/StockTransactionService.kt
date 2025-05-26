package com.gmin.servereaglered.service

import com.gmin.servereaglered.model.StockTransDetailEntity
import com.gmin.servereaglered.model.StockTransDetailId
import com.gmin.servereaglered.model.StockTransMasterEntity
import com.gmin.servereaglered.model.StockTransMasterId
import com.gmin.servereaglered.repository.ProductionPerformanceRepository
import com.gmin.servereaglered.repository.StockTransDetailRepository
import com.gmin.servereaglered.repository.StockTransMasterRepository
import com.gmin.serverstandard.adapter.`in`.web.dto.StockTransDetailDto
import com.gmin.serverstandard.adapter.`in`.web.dto.StockTransactionDto
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.NoSuchElementException

@Service
class StockTransactionService(
    private val stockTransMasterRepository: StockTransMasterRepository,
    private val stockTransDetailRepository: StockTransDetailRepository
) {
    /**
     * 재고 번호(stkNo)로 관련된 재고 이동 마스터와 모든 상세 정보를 조회합니다.
     * stkNo를 사용하여 마스터와 관련된 모든 상세 정보를 조회합니다.
     *
     * @param stkNo 재고 번호 (StockTransMaster 및 Detail의 키 일부)
     * @return 재고 이동 DTO 목록 (현재는 단일 마스터에 대한 정보만 포함)
     * @throws NoSuchElementException 해당 stkNo에 대한 마스터 정보가 없을 경우
     */
    fun getStockTransactions(stkNo: String): List<StockTransactionDto> {
        // 1. StockTransMaster 조회 (복합키 객체 생성)
        val masterId = StockTransMasterId(stkNo) // StockTransMasterEntity의 PK 구조에 맞게 ID 생성
        val master = stockTransMasterRepository.findById(masterId)
            .orElseThrow { NoSuchElementException("StockTransMaster not found for StkNo: $stkNo") }

        // 2. StockTransDetail 조회 (stkNo 기준 모든 상세 내역)
        // StockTransDetailRepository에 findById_StkNo 메서드가 정의되어 있어야 합니다.
        val details = stockTransDetailRepository.findById_StkNo(stkNo)

        // 3. DTO 생성
        val dto = createStockTransactionDto(master, details)

        // 4. 결과를 List<StockTransactionDto> 형태로 반환 (현재는 단일 요소 리스트)
        return listOf(dto)
    }

    /**
     * 품목 코드(itemCd)로 관련된 모든 재고 이동 정보를 조회합니다.
     * 품목 코드를 사용하여 관련된 모든 상세 정보와 그에 해당하는 마스터 정보를 조회합니다.
     *
     * @param itemCd 품목 코드
     * @return 재고 이동 DTO 목록
     */
    fun getStockTransactionsByItemCode(itemCd: String): List<StockTransactionDto> {
        // 1. 품목 코드로 StockTransDetail 조회
        val allDetails = stockTransDetailRepository.findByItemCd(itemCd)

        // 1.1. DelYn이 'Y'이 아닌 상세 정보만 필터링
        val activeDetails = allDetails.filter { it.delYn != "Y" }

        if (activeDetails.isEmpty()) {
            return emptyList()
        }

        // 2. 조회된 활성 상세 정보에서 고유한 stkNo 목록 추출
        val stkNos = activeDetails.map { it.id.stkNo }.distinct()

        // 3. 각 stkNo에 대한 마스터 정보 조회 및 DTO 생성
        val result = mutableListOf<StockTransactionDto>()

        for (stkNo in stkNos) {
            val masterId = StockTransMasterId(stkNo)
            val masterOptional = stockTransMasterRepository.findById(masterId)

            if (masterOptional.isPresent) {
                val master = masterOptional.get()
                // StockTransMaster의 DelYn이 'Y'인 경우 제외
                if (master.delYn != "Y") {
                    // 해당 stkNo를 가지고, DelYn이 'N'이 아닌 상세 정보만 필터링 (activeDetails에서 필터링)
                    val stkDetailsForMaster = activeDetails.filter { it.id.stkNo == stkNo }

                    // 이 마스터에 속하는 활성 상세 정보가 하나라도 있는 경우에만 DTO 생성
                    if (stkDetailsForMaster.isNotEmpty()) {
                        val dto = createStockTransactionDto(master, stkDetailsForMaster)
                        result.add(dto)
                    }
                }
            }
        }

        return result
    }

    /**
     * 품목 코드(itemCd)에 대한 총 재고 수량을 계산합니다.
     * 품목 코드를 사용하여 관련된 모든 상세 정보의 transQty 합계를 계산합니다.
     *
     * @param itemCd 품목 코드
     * @return 총 재고 수량 (BigDecimal)
     */
    fun getInventoryQuantityByItemCode(itemCd: String): BigDecimal {
        // 1. 품목 코드로 재고 이동 정보 조회
        val stockTransactions = getStockTransactionsByItemCode(itemCd)

        // 2. 총 재고량 계산 (TransQty 총합)
        var totalInventory = BigDecimal.ZERO
        stockTransactions.forEach { stockTransaction ->
            stockTransaction.details.forEach { detail ->
                if (detail.itemCd == itemCd) {
                    totalInventory = totalInventory.add(detail.transQty)
                }
            }
        }

        return totalInventory
    }

    /**
     * 자재 출고에 대한 재고 이동 정보를 생성합니다.
     * 
     * @param stkNo 재고 번호
     * @param itemCd 품목 코드
     * @param transQty 이동 수량 (음수값으로 전달)
     * @param inputUser 입력자
     * @return 생성된 재고 이동 마스터 엔티티
     */
    @Transactional
    fun createMaterialOutStockTransaction(
        stkNo: String,
        itemCd: String,
        transQty: BigDecimal,
        inputUser: String
    ): StockTransMasterEntity {
        // 1. StockTransMaster 생성
        val stockTransMasterId = StockTransMasterId(stkNo)
        val stockTransMaster = StockTransMasterEntity(
            id = stockTransMasterId,
            compCd = "1500",
            stkDate = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")),
            stkType = "30",
            warehouseCd = "WH-Materials",
            remk = null,
            delYn = "N",
            inputDate = java.util.Date(),
            inputUser = inputUser
        )
        stockTransMasterRepository.save(stockTransMaster)

        // 2. StockTransDetail 생성
        val stockTransDetailId = StockTransDetailId(stkNo, 1)
        val stockTransDetail = StockTransDetailEntity(
            id = stockTransDetailId,
            compCd = "1500",
            itemCd = itemCd,
            transQty = transQty.negate(), // 출고수량의 음수값
            delYn = "N",
            inputDate = java.util.Date(),
            inputUser = inputUser
        )
        stockTransDetailRepository.save(stockTransDetail)

        return stockTransMaster
    }

    /**
     * 생산 입고에 대한 재고 이동 정보를 생성합니다.
     * 
     * @param stkNo 재고 번호
     * @param itemCd 품목 코드 (생산된 제품 코드)
     * @param transQty 이동 수량 (양수값으로 전달)
     * @param inputUser 입력자
     * @return 생성된 재고 이동 마스터 엔티티
     */
    @Transactional
    fun createProductionInStockTransaction(
        stkNo: String,
        itemCd: String,
        transQty: BigDecimal,
        inputUser: String
    ): StockTransMasterEntity {
        // 1. StockTransMaster 생성
        val stockTransMasterId = StockTransMasterId(stkNo)
        val stockTransMaster = StockTransMasterEntity(
            id = stockTransMasterId,
            compCd = "1500",
            stkDate = java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")),
            stkType = "20",
            warehouseCd = "WH-Production",
            remk = null,
            delYn = "N",
            inputDate = java.util.Date(),
            inputUser = inputUser
        )
        stockTransMasterRepository.save(stockTransMaster)

        // 2. StockTransDetail 생성
        val stockTransDetailId = StockTransDetailId(stkNo, 1)
        val stockTransDetail = StockTransDetailEntity(
            id = stockTransDetailId,
            compCd = "1500",
            itemCd = itemCd,
            transQty = transQty, // 입고수량은 양수값
            delYn = "N",
            inputDate = java.util.Date(),
            inputUser = inputUser
        )
        stockTransDetailRepository.save(stockTransDetail)

        return stockTransMaster
    }

    /**
     * 엔티티를 DTO로 변환합니다.
     *
     * @param master 재고 이동 마스터 엔티티
     * @param details 재고 이동 상세 엔티티 목록
     * @return 변환된 재고 이동 DTO
     */
    private fun createStockTransactionDto(
        master: StockTransMasterEntity,
        details: List<StockTransDetailEntity>
    ): StockTransactionDto {
        val detailDtos = details.map { detail ->
            StockTransDetailDto(
                stkNo = detail.id.stkNo,
                stkSeq = detail.id.stkSeq,
                compCd = detail.compCd,
                itemCd = detail.itemCd,
                transQty = detail.transQty,
                delYn = detail.delYn,
                inputDate = detail.inputDate,
                inputUser = detail.inputUser
            )
        }

        return StockTransactionDto(
            stkNo = master.id.stkNo,
            compCd = master.compCd,
            stkDate = master.stkDate,
            stkType = master.stkType,
            warehouseCd = master.warehouseCd,
            remk = master.remk,
            delYn = master.delYn,
            inputDate = master.inputDate,
            inputUser = master.inputUser,
            details = detailDtos
        )
    }
}
