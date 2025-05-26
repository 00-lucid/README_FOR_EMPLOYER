package com.gmin.servereaglered.service

import com.gmin.servereaglered.model.ProductionPerformanceEntity
import com.gmin.servereaglered.model.ProductionPerformanceId
import com.gmin.servereaglered.repository.ProductionPerformanceRepository
import com.gmin.serverstandard.adapter.`in`.web.dto.ProductionPerformanceDto
import com.gmin.serverstandard.application.port.`in`.command.ProductionPerformanceCommand
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Date
import java.util.NoSuchElementException
import java.util.regex.Pattern

@Service
class ProductionPerformanceService(
    private val productionPerformanceRepository: ProductionPerformanceRepository
) {
    /**
     * 생산 실적의 StkNo를 업데이트합니다.
     *
     * @param workOrderNo 작업지시번호
     * @param workOrderSeq 작업지시순번
     * @param performNo 실적번호
     * @param stkNo 업데이트할 재고번호
     * @return 업데이트된 생산 실적 엔티티
     * @throws NoSuchElementException 해당 ID의 생산 실적이 없을 경우
     */
    @Transactional
    fun updateStkNo(workOrderNo: String, workOrderSeq: Int, performNo: String, stkNo: String): ProductionPerformanceEntity {
        val id = ProductionPerformanceId(workOrderNo, workOrderSeq, performNo)
        val entity = productionPerformanceRepository.findById(id)
            .orElseThrow { NoSuchElementException("생산 실적을 찾을 수 없습니다.") }

        // 불변 객체이므로 새 객체를 생성하여 업데이트
        val updatedEntity = ProductionPerformanceEntity(
            id = entity.id,
            compCd = entity.compCd,
            lotNo = entity.lotNo,
            memberCd = entity.memberCd,
            workDate = entity.workDate,
            itemCd = entity.itemCd,
            makeQty = entity.makeQty,
            makeOkQty = entity.makeOkQty,
            makeBadQty = entity.makeBadQty,
            badType = entity.badType,
            badReason = entity.badReason,
            stkNo = stkNo, // 여기서 StkNo 업데이트
            remk = entity.remk,
            delYn = entity.delYn,
            inputDate = entity.inputDate,
            inputUser = entity.inputUser
        )

        return productionPerformanceRepository.save(updatedEntity)
    }
    /**
     * 모든 생산 실적을 조회합니다.
     *
     * @return 생산 실적 엔티티 리스트
     */
    fun getAllProductionPerformances(): List<ProductionPerformanceEntity> {
        // createdAt 필드가 없으므로 기본 findAll() 메서드 사용
        return productionPerformanceRepository.findAll()
    }

    /**
     * 특정 ID의 생산 실적을 조회하고 InputDate 기준으로 내림차순 정렬합니다.
     *
     * @param workOrderNo 작업지시번호
     * @param workOrderSeq 작업지시순번
     * @return InputDate로 정렬된 생산 실적 엔티티 리스트
     * @throws NoSuchElementException 해당 ID의 생산 실적이 없을 경우
     */
    fun getProductionPerformanceById(workOrderNo: String, workOrderSeq: Int): List<ProductionPerformanceEntity> {
        val performances = productionPerformanceRepository.findByWorkOrderAndSeq(workOrderNo, workOrderSeq)
            .orElseThrow { NoSuchElementException("생산 실적을 찾을 수 없습니다.") }
        // InputDate 기준으로 내림차순 정렬 (최신 날짜가 먼저 오도록)
        // ProductionPerformanceEntity에 inputDate: Date? 필드가 있다고 가정합니다.
        return performances.sortedByDescending { it.inputDate }
    }

    /**
     * 특정 작업지시번호와 작업지시순번에 대한 이전 생산 수량의 합계를 계산합니다.
     *
     * @param workOrderNo 작업지시번호
     * @param workOrderSeq 작업지시순번
     * @return 이전 생산 수량의 합계
     */
    fun getPreviousProductionQuantity(workOrderNo: String, workOrderSeq: Int): Int {
        val performances = productionPerformanceRepository.findByWorkOrderAndSeq(workOrderNo, workOrderSeq)
            .orElse(emptyList())

        return performances.sumOf { 
            it.makeOkQty.toInt()
        }
    }

    /**
     * 새로운 생산 실적을 생성합니다.
     *
     * @param productionPerformanceDto 생산 실적 DTO
     * @return 생성된 생산 실적 엔티티
     */
    @Transactional
    fun createProductionPerformance(productionPerformanceCommand: ProductionPerformanceCommand): ProductionPerformanceEntity {
        val newPerformNo = generateNextPerformNo()
        val newLotNo = generateNextLotNo("1500", productionPerformanceCommand.itemCode)

        val entity = ProductionPerformanceEntity.fromCommand(productionPerformanceCommand, newPerformNo, newLotNo)

        return productionPerformanceRepository.save(entity)
    }

    /**
     * 오늘 날짜를 기준으로 다음 performNo를 생성합니다. (예: 20250422-0001)
     *
     * @return 생성된 performNo 문자열
     */
    private fun generateNextPerformNo(): String {
        val today = LocalDate.now()
        // "yyyyMMdd-" 형식의 접두사 생성 (예: "20250422-")
        val datePrefix = today.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-"

        // 리포지토리를 사용하여 해당 날짜의 마지막 performNo 조회
        val lastEntity = productionPerformanceRepository.findTopById_PerformNoStartingWithOrderById_PerformNoDesc(datePrefix)
        val lastPerformNo = lastEntity?.id?.performNo

        // 다음 시퀀스 번호 계산
        val nextSequence = if (lastPerformNo != null) {
            // 마지막 번호가 있으면, "-" 뒤의 숫자 부분을 추출하여 +1
            val sequencePart = lastPerformNo.substringAfter(datePrefix)
            try {
                sequencePart.toInt() + 1
            } catch (e: NumberFormatException) {
                // 혹시 모를 예외 상황 (예: "-" 뒤가 숫자가 아닌 경우) 처리
                println("Warning: Could not parse sequence number from $lastPerformNo. Starting from 1.")
                1
            }
        } else {
            // 해당 날짜의 첫 번째 데이터인 경우 1로 시작
            1
        }

        // 시퀀스 번호를 4자리 문자열로 포맷 (예: 1 -> "0001", 123 -> "0123")
        val formattedSequence = String.format("%04d", nextSequence)

        // 최종 performNo 조합 (예: "20250422-0001")
        return "$datePrefix$formattedSequence"
    }

    /**
     * 오늘 날짜와 회사 코드, 품목 코드를 기준으로 다음 LotNo를 생성합니다.
     * 형식: LOT-{ItemCd}-{yyyyMMdd}-{XXXX}
     *
     * @param compCd 회사 코드
     * @param itemCd 품목 코드
     * @return 생성된 LotNo 문자열
     */
    private fun generateNextLotNo(compCd: String, itemCd: String): String {
        val today = LocalDate.now()
        // 'yyyyMMdd' 형식 (LotNo 중간 부분)
        val datePart = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"))

        // 해당 회사, 해당 날짜의 마지막 LotNo 조회
        val lastEntity = productionPerformanceRepository.findTopByCompCdAndWorkDateOrderByLotNoDesc(compCd, Date())
        val lastLotNo = lastEntity?.lotNo

        // 다음 시퀀스 번호 계산
        val nextSequence = if (lastLotNo != null && lastLotNo.startsWith("LOT-") && lastLotNo.contains("-$datePart-")) {
            try {
                // 마지막 4자리 숫자 추출 (정규식 사용)
                val pattern = Pattern.compile(".*-(\\d{4})$")
                val matcher = pattern.matcher(lastLotNo)
                if (matcher.matches()) {
                    matcher.group(1).toInt() + 1
                } else {
                    println("Warning: Could not parse sequence number from LotNo: $lastLotNo. Starting from 1.")
                    1 // 파싱 실패 시 1부터 시작
                }
            } catch (e: NumberFormatException) {
                println("Warning: Could not parse sequence number from LotNo: $lastLotNo. Starting from 1.")
                1 // 숫자 변환 실패 시 1부터 시작
            }
        } else {
            1 // 해당 날짜의 첫 번째 데이터거나 형식이 맞지 않으면 1로 시작
        }

        // 시퀀스 번호를 4자리 문자열로 포맷
        val formattedSequence = String.format("%04d", nextSequence)

        // 최종 LotNo 조합
        return "LOT-$itemCd-$datePart-$formattedSequence"
    }
}
