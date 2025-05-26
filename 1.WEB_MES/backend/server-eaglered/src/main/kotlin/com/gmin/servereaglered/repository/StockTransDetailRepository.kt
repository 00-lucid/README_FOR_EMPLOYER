package com.gmin.servereaglered.repository

import com.gmin.servereaglered.model.StockTransDetailEntity
import com.gmin.servereaglered.model.StockTransDetailId
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * 재고 이동 상세 리포지토리
 * 재고 이동 상세 데이터에 접근하기 위한 인터페이스입니다.
 */
@Repository
interface StockTransDetailRepository : JpaRepository<StockTransDetailEntity, StockTransDetailId> {
    /**
     * 특정 재고 이동 번호에 해당하는 재고 이동 상세를 조회합니다.
     *
     * @param stkNo 재고 이동 번호
     * @return 재고 이동 상세 엔티티 목록
     */
    fun findById_StkNo(stkNo: String): List<StockTransDetailEntity>

    /**
     * 특정 재고 이동 번호 목록에 해당하는 재고 이동 상세를 조회합니다.
     *
     * @param stkNos 재고 이동 번호 목록
     * @return 재고 이동 상세 엔티티 목록
     */
    fun findAllById_StkNoIn(stkNos: List<String>): List<StockTransDetailEntity>

    /**
     * 특정 품목 코드에 해당하는 재고 이동 상세를 조회합니다.
     *
     * @param itemCd 품목 코드
     * @return 재고 이동 상세 엔티티 목록
     */
    fun findByItemCd(itemCd: String): List<StockTransDetailEntity>
}
