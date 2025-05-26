package com.gmin.serverstandard.adapter.out.persistence.repository

import com.gmin.serverstandard.adapter.out.persistence.entity.BomEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SpringDataBomRepository : JpaRepository<BomEntity, Int> {
    /**
     * 특정 상태의 BOM을 조회합니다.
     *
     * @param bomStatus 조회할 BOM 상태
     * @return 해당 상태의 BOM 목록
     */
    fun findByBomStatus(bomStatus: String): List<BomEntity>?
}