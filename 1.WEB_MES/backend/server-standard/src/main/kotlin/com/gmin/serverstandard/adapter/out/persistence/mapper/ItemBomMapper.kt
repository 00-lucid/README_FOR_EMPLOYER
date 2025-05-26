package com.gmin.serverstandard.adapter.out.persistence.mapper

import com.gmin.serverstandard.adapter.out.persistence.entity.ItemBomEntity
import com.gmin.serverstandard.application.domain.model.ItemBom
import org.springframework.stereotype.Component

@Component
class ItemBomMapper {
    /**
     * ItemBomEntity를 도메인 엔티티인 ItemBom으로 매핑합니다.
     *
     * @param itemBomEntity JPA 엔티티
     * @return 변환된 도메인 엔티티
     */
    fun mapToDomainEntity(itemBomEntity: ItemBomEntity): ItemBom {
        return ItemBom(
            bomId = itemBomEntity.bomId,
            itemId = itemBomEntity.itemId,
            quantity = itemBomEntity.quantity,
            remark = itemBomEntity.remark,
            parentItemId = itemBomEntity.parentItemId
        )
    }

    /**
     * 도메인 엔티티인 ItemBom을 JPA 엔티티로 매핑합니다.
     *
     * @param itemBom 도메인 엔티티
     * @return 변환된 JPA 엔티티
     */
    fun mapToJpaEntity(itemBom: ItemBom): ItemBomEntity {
        return ItemBomEntity(
            bomId = itemBom.bomId,
            itemId = itemBom.itemId,
            quantity = itemBom.quantity,
            remark = itemBom.remark,
            parentItemId = itemBom.parentItemId
        )
    }
}