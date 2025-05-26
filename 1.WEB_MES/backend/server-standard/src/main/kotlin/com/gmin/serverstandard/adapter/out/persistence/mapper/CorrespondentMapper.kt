package com.gmin.serverstandard.adapter.out.persistence.mapper

import com.gmin.serverstandard.adapter.out.persistence.entity.CorrespondentEntity
import com.gmin.serverstandard.application.domain.model.Correspondent
import org.springframework.stereotype.Component

@Component
class CorrespondentMapper {
    /**
     * CorrespondentEntity를 도메인 엔티티인 Correspondent로 매핑합니다.
     *
     * @param correspondentEntity JPA 엔티티
     * @return 변환된 도메인 엔티티
     */
    fun mapToDomainEntity(correspondentEntity: CorrespondentEntity): Correspondent {
        return Correspondent(
            correspondentId = correspondentEntity.correspondentId ?: -1,
            name = correspondentEntity.name,
            type = correspondentEntity.type,
            ceo = correspondentEntity.ceo,
            businessNumber = correspondentEntity.businessNumber,
            phoneNumber = correspondentEntity.phoneNumber,
            email = correspondentEntity.email,
            address = correspondentEntity.address,
            detailAddress = correspondentEntity.detailAddress,
            note = correspondentEntity.note,
            correspondentPhotoUri = correspondentEntity.correspondentPhotoUri,
            createdAt = correspondentEntity.createdAt,
            updatedAt = correspondentEntity.updatedAt
        )
    }

    /**
     * 도메인 엔티티인 Correspondent를 JPA 엔티티로 매핑합니다.
     *
     * @param correspondent 도메인 엔티티
     * @return 변환된 JPA 엔티티
     */
    fun mapToJpaEntity(correspondent: Correspondent): CorrespondentEntity {
        return CorrespondentEntity(
            correspondentId = if (correspondent.correspondentId == -1 || correspondent.correspondentId == 0) null else correspondent.correspondentId,
            name = correspondent.name,
            type = correspondent.type,
            ceo = correspondent.ceo,
            businessNumber = correspondent.businessNumber,
            phoneNumber = correspondent.phoneNumber,
            email = correspondent.email,
            address = correspondent.address,
            detailAddress = correspondent.detailAddress,
            note = correspondent.note,
            correspondentPhotoUri = correspondent.correspondentPhotoUri,
            createdAt = correspondent.createdAt,
            updatedAt = correspondent.updatedAt
        )
    }
}