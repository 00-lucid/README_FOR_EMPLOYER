package com.gmin.servereaglered.repository

import com.gmin.servereaglered.model.PurchaseOrderInItemCheckEntity
import com.gmin.servereaglered.model.PurchaseOrderInItemCheckId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Date

@Repository
interface PurchaseOrderInItemCheckRepository: JpaRepository<PurchaseOrderInItemCheckEntity, PurchaseOrderInItemCheckId> {
    /**
     * 특정 등록 날짜 범위 내의 입고 검사 내역을 조회하고, 등록일(InputDate) 기준 최신순으로 정렬합니다.
     *
     * @param startDate 시작 날짜 및 시간
     * @param endDate 종료 날짜 및 시간
     * @return 최신순으로 정렬된 입고 검사 엔티티 리스트
     */
    // OrderByInputDateDesc 추가하여 InputDate 내림차순(최신순) 정렬
    fun findByInputDateBetweenOrderByInputDateDesc(startDate: LocalDateTime, endDate: LocalDateTime): List<PurchaseOrderInItemCheckEntity>

    /**
     * 승인 상태별 입고 검사 내역을 조회합니다.
     *
     * @param isApproved 승인 상태
     * @return 입고 검사 엔티티 리스트
     */
    fun findByIsApproved(isApproved: Boolean): List<PurchaseOrderInItemCheckEntity>
}