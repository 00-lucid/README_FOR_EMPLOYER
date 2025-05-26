package com.gmin.servereaglered.service

import com.gmin.servereaglered.model.FactOutItemInfoEntity
import com.gmin.servereaglered.model.FactOutItemInfoId
import com.gmin.servereaglered.repository.FactOutItemInfoRepository
import com.gmin.servereaglered.repository.StockTransMasterRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Service
class FactOutItemInfoService(
    private val factOutItemInfoRepository: FactOutItemInfoRepository,
    private val stockTransMasterRepository: StockTransMasterRepository
) {
    
    /**
     * 자재출고정보를 추가합니다.
     * 
     * @param workOrderNo 작업지시번호
     * @param workOrderSeq 작업지시순번
     * @param outItemCd 출고품목코드
     * @param outQty 출고수량
     * @param performNo 실적번호 (선택적)
     * @param remk 비고 (선택적)
     * @param inputUser 입력자
     * @return 생성된 자재출고정보 엔티티
     */
    @Transactional
    fun addFactOutItemInfo(
        workOrderNo: String,
        workOrderSeq: Int,
        outItemCd: String,
        outQty: BigDecimal,
        performNo: String? = null,
        remk: String? = null,
        inputUser: String
    ): FactOutItemInfoEntity {
        // 회사코드는 1500으로 고정
        val compCd = "1500"
        
        // 출고유형은 'AUTO'로 고정
        val outType = "AUTO"
        
        // 출고순번 자동 채번
        val nextOutSeq = generateNextOutSeq(compCd, workOrderNo, workOrderSeq)
        
        // 재고번호 자동 채번
        val stkNo = generateNextStkNo(compCd)
        
        // 엔티티 ID 생성
        val id = FactOutItemInfoId(workOrderNo, workOrderSeq, nextOutSeq)
        
        // 엔티티 생성
        val entity = FactOutItemInfoEntity(
            id = id,
            compCd = compCd,
            performNo = performNo,
            outType = outType,
            outItemCd = outItemCd,
            outQty = outQty,
            stkNo = stkNo,
            remk = remk,
            delYn = "N",  // 기본값은 삭제되지 않음
            inputDate = LocalDateTime.now(),
            inputUser = inputUser
        )
        
        // 저장 및 반환
        return factOutItemInfoRepository.save(entity)
    }
    
    /**
     * 다음 출고순번을 생성합니다.
     * 
     * @param compCd 회사코드
     * @param workOrderNo 작업지시번호
     * @param workOrderSeq 작업지시순번
     * @return 다음 출고순번
     */
    private fun generateNextOutSeq(compCd: String, workOrderNo: String, workOrderSeq: Int): Int {
        // 현재 최대 출고순번 조회
        val maxOutSeq = factOutItemInfoRepository.findMaxOutSeqByWorkOrder(compCd, workOrderNo, workOrderSeq)
        
        // 다음 출고순번 반환 (현재 최대값 + 1)
        return maxOutSeq + 1
    }
    
    /**
     * 다음 재고번호(StkNo)를 생성합니다.
     * 형식: 'STK-yyyyMMdd-XXX' (예: 'STK-20240101-001')
     * 
     * @param compCd 회사코드
     * @return 생성된 재고번호
     */
    private fun generateNextStkNo(compCd: String): String {
        val today = LocalDate.now()
        val dateStr = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"))
        
        // 오늘 날짜에 해당하는 패턴 생성 (예: 'STK-20240101-')
        val pattern = "STK-$dateStr-%"
        val basePattern = "STK-$dateStr-"
        
        // 현재 최대 번호 조회
        val maxNumber = stockTransMasterRepository.findMaxStkNoNumberByPattern(compCd, basePattern)
        
        // 다음 번호 계산 및 3자리 형식으로 포맷팅
        val nextNumber = maxNumber + 1
        val formattedNumber = String.format("%03d", nextNumber)
        
        // 최종 재고번호 반환
        return "$basePattern$formattedNumber"
    }
}