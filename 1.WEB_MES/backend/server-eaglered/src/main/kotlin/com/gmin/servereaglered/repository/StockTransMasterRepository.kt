package com.gmin.servereaglered.repository

import com.gmin.servereaglered.model.StockTransMasterEntity
import com.gmin.servereaglered.model.StockTransMasterId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

/**
 * 재고 이동 마스터 리포지토리
 * 재고 이동 마스터 데이터에 접근하기 위한 인터페이스입니다.
 */
@Repository
interface StockTransMasterRepository : JpaRepository<StockTransMasterEntity, StockTransMasterId> {

    /**
     * 특정 회사코드와 StkNo 패턴에 맞는 레코드 중 StkNo의 숫자 부분 최댓값을 조회합니다.
     * 예: pattern이 'STK-20240101-%' 이면, 'STK-20240101-' 다음의 숫자 부분 최댓값을 찾습니다.
     *
     * @param compCd 회사코드
     * @param pattern StkNo 패턴 (예: 'STK-20240101-%')
     * @return 해당 패턴의 StkNo 중 가장 큰 숫자 부분 (없으면 0 반환)
     */
    @Query(
        value = """
        SELECT COALESCE(MAX(CAST(SUBSTRING(s.StkNo, LEN(REPLACE(:pattern, '%', '')) + 1, LEN(s.StkNo) - LEN(REPLACE(:pattern, '%', ''))) AS INT)), 0)
        FROM StockTransMaster s
        WHERE s.CompCd = :compCd AND s.StkNo LIKE :pattern
        """,
        nativeQuery = true // 네이티브 SQL 쿼리임을 명시
    )
    fun findMaxStkNoNumberByPattern(
        @Param("compCd") compCd: String,
        @Param("pattern") pattern: String
    ): Int
}
