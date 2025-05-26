package com.gmin.servereaglered.repository

import com.gmin.servereaglered.model.BomEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface BomRepository : JpaRepository<BomEntity, String> {
    /**
     * 품목 코드(itemCd)로 BOM 정보를 조회합니다.
     *
     * @param itemCd 품목 코드
     * @return 해당 품목 코드에 대한 BOM 엔티티 목록
     */
    fun findByItemCd(itemCd: String): List<BomEntity>
}