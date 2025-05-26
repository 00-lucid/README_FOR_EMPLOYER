package com.gmin.servereaglered.repository

import com.gmin.servereaglered.model.ProductionPerformanceEntity
import com.gmin.servereaglered.model.ProductionPerformanceId
import io.lettuce.core.dynamic.annotation.Param
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.util.Date
import java.util.Optional

/**
 * 생산 실적 리포지토리
 * 생산 실적 데이터에 접근하기 위한 인터페이스입니다.
 */
@Repository
interface ProductionPerformanceRepository : JpaRepository<ProductionPerformanceEntity, ProductionPerformanceId> {
    @Query("SELECT p FROM ProductionPerformanceEntity p WHERE p.id.workOrderNo = :workOrderNo AND p.id.workOrderSeq = :workOrderSeq")
    fun findByWorkOrderAndSeq(@Param("workOrderNo") workOrderNo: String, @Param("workOrderSeq") workOrderSeq: Int): Optional<List<ProductionPerformanceEntity>>

    /**
     * 특정 날짜 접두사로 시작하는 performNo를 가진 엔티티 중
     * performNo를 기준으로 내림차순 정렬했을 때 가장 첫 번째 엔티티를 찾습니다.
     * (즉, 해당 날짜의 가장 마지막 performNo를 가진 엔티티를 찾음)
     *
     * @param datePrefix "yyyyMMdd-" 형식의 날짜 접두사
     * @return 가장 마지막 ProductionPerformanceEntity 또는 null (해당 날짜 데이터가 없을 경우)
     */
    fun findTopById_PerformNoStartingWithOrderById_PerformNoDesc(datePrefix: String): ProductionPerformanceEntity?

    /**
     * 특정 회사 코드와 작업 일자를 기준으로 LotNo를 내림차순 정렬했을 때
     * 가장 첫 번째(가장 큰 LotNo) 엔티티를 찾습니다.
     * WorkDate는 'yyyy-MM-dd' 형식 문자열로 비교합니다.
     *
     * @param compCd 회사 코드
     * @param workDate 작업 일자 (yyyy-MM-dd 형식)
     * @return 가장 마지막 LotNo를 가진 ProductionPerformanceEntity 또는 null
     */
    fun findTopByCompCdAndWorkDateOrderByLotNoDesc(compCd: String, workDate: Date): ProductionPerformanceEntity?
}
