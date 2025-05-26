package com.gmin.servereaglered.repository

import com.gmin.servereaglered.model.WorkOrderDetailEntity
import com.gmin.servereaglered.model.WorkOrderDetailId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * 작업지시 상세 리포지토리
 * 작업지시 상세 데이터에 접근하기 위한 인터페이스입니다.
 */
@Repository
interface WorkOrderDetailRepository : JpaRepository<WorkOrderDetailEntity, WorkOrderDetailId> {
    /**
     * 특정 작업지시번호에 해당하는 작업지시 상세를 조회합니다.
     *
     * @param workOrderNo 작업지시번호
     * @return 작업지시 상세 엔티티 리스트
     */
    fun findByIdWorkOrderNo(workOrderNo: String): List<WorkOrderDetailEntity>
}