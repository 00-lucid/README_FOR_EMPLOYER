package com.gmin.serverstandard.adapter.out.persistence.repository

import com.gmin.serverstandard.adapter.out.persistence.entity.CorrespondentEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SpringDataCorrespondentRepository : JpaRepository<CorrespondentEntity, Int> {
    /**
     * 특정 타입의 거래처를 조회합니다.
     *
     * @param type 조회할 거래처 타입
     * @return 해당 타입의 거래처 목록
     */
    fun findByType(type: String): List<CorrespondentEntity>?
}