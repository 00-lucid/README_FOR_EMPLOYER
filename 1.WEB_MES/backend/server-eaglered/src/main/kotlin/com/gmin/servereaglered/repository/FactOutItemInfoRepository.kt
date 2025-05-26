package com.gmin.servereaglered.repository

import com.gmin.servereaglered.model.FactOutItemInfoEntity
import com.gmin.servereaglered.model.FactOutItemInfoId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

/**
 * 자재출고정보 리포지토리
 * 자재출고정보 데이터에 접근하기 위한 인터페이스입니다.
 */
@Repository
interface FactOutItemInfoRepository : JpaRepository<FactOutItemInfoEntity, FactOutItemInfoId> {
    
    /**
     * 특정 작업지시번호와 작업지시순번에 대한 최대 출고순번을 조회합니다.
     *
     * @param compCd 회사코드
     * @param workOrderNo 작업지시번호
     * @param workOrderSeq 작업지시순번
     * @return 최대 출고순번 (없으면 0 반환)
     */
    @Query("SELECT COALESCE(MAX(f.id.outSeq), 0) FROM FactOutItemInfoEntity f " +
           "WHERE f.compCd = :compCd AND f.id.workOrderNo = :workOrderNo AND f.id.workOrderSeq = :workOrderSeq")
    fun findMaxOutSeqByWorkOrder(
        @Param("compCd") compCd: String,
        @Param("workOrderNo") workOrderNo: String, 
        @Param("workOrderSeq") workOrderSeq: Int
    ): Int
}