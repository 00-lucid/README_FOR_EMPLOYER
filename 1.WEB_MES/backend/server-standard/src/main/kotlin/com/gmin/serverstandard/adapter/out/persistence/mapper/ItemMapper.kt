package com.gmin.serverstandard.adapter.out.persistence.mapper

import com.gmin.serverstandard.adapter.out.persistence.entity.ItemEntity
import com.gmin.serverstandard.application.domain.model.Item
import org.springframework.stereotype.Component

@Component
class ItemMapper {
    /**
     * ItemEntity를 도메인 엔티티인 Item으로 매핑합니다.
     *
     * @param itemEntity JPA 엔티티
     * @return 변환된 도메인 엔티티
     */
    fun mapToDomainEntity(itemEntity: ItemEntity): Item {
        return Item(
            itemId = itemEntity.itemId ?: -1,
            itemName = itemEntity.itemName,
            itemType = itemEntity.itemType,
            unit = itemEntity.unit,
            salePrice = itemEntity.salePrice,
            createdAt = itemEntity.createdAt,
            updatedAt = itemEntity.updatedAt,
            itemPhotoUri = itemEntity.itemPhotoUri,
            companyId = itemEntity.companyId
        )
    }

    /**
     * 도메인 엔티티인 Item을 JPA 엔티티로 매핑합니다.
     *
     * @param item 도메인 엔티티
     * @return 변환된 JPA 엔티티
     */
    fun mapToJpaEntity(item: Item): ItemEntity {
        return ItemEntity(
            itemId = if (item.itemId == -1 || item.itemId == 0) null else item.itemId,
            itemName = item.itemName,
            itemType = item.itemType,
            unit = item.unit,
            salePrice = item.salePrice,
            createdAt = item.createdAt,
            updatedAt = item.updatedAt,
            itemPhotoUri = item.itemPhotoUri,
            companyId = item.companyId
        )
    }
}