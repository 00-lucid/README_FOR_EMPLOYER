package com.gmin.servereaglered.repository

import com.gmin.servereaglered.model.WorkOrderMasterEntity
import com.gmin.servereaglered.model.WorkOrderMasterId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

/**
 * 작업지시 마스터 리포지토리
 * 작업지시 마스터 데이터에 접근하기 위한 인터페이스입니다.
 */
@Repository
interface WorkOrderMasterRepository : JpaRepository<WorkOrderMasterEntity, WorkOrderMasterId> {
    /**
     * 특정 작업지시번호로 작업지시 마스터를 조회합니다.
     *
     * @param workOrderNo 작업지시번호
     * @return 작업지시 마스터 엔티티 리스트
     */
    fun findByIdWorkOrderNo(workOrderNo: String): List<WorkOrderMasterEntity>

    /**
     * 특정 기간 내의 작업지시 마스터를 조회합니다.
     *
     * @param startDate 시작일 (yyyy-MM-dd 형식)
     * @param endDate 종료일 (yyyy-MM-dd 형식)
     * @return 작업지시 마스터 엔티티 리스트
     */
    @Query("SELECT w FROM WorkOrderMasterEntity w WHERE w.workOrderDate >= :startDate AND w.workOrderDate <= :endDate AND w.delYn != 'Y'")
    fun findByWorkOrderDateBetween(@Param("startDate") startDate: String, @Param("endDate") endDate: String): List<WorkOrderMasterEntity>
}
