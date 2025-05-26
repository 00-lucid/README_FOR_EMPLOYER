package com.gmin.serverstandard.adapter.out.persistence.mapper

import com.gmin.serverstandard.adapter.out.persistence.entity.BomEntity
import com.gmin.serverstandard.application.domain.model.Bom
import org.springframework.stereotype.Component

@Component
class BomMapper {
    /**
     * BomEntity를 도메인 엔티티인 Bom으로 매핑합니다.
     *
     * @param bomEntity JPA 엔티티
     * @return 변환된 도메인 엔티티
     */
    fun mapToDomainEntity(bomEntity: BomEntity): Bom {
        return Bom(
            bomId = bomEntity.bomId ?: -1,
            bomStatus = bomEntity.bomStatus,
            bomVersion = bomEntity.bomVersion,
            remark = bomEntity.remark,
            createdAt = bomEntity.createdAt,
            updatedAt = bomEntity.updatedAt
        )
    }

    /**
     * 도메인 엔티티인 Bom을 JPA 엔티티로 매핑합니다.
     *
     * @param bom 도메인 엔티티
     * @return 변환된 JPA 엔티티
     */
    fun mapToJpaEntity(bom: Bom): BomEntity {
        return BomEntity(
            bomId = if (bom.bomId == -1 || bom.bomId == 0) null else bom.bomId,
            bomStatus = bom.bomStatus,
            bomVersion = bom.bomVersion,
            remark = bom.remark,
            createdAt = bom.createdAt,
            updatedAt = bom.updatedAt
        )
    }
}