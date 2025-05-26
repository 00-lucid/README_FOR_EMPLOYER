package com.gmin.serverstandard.adapter.out.persistence.mapper

import com.gmin.serverstandard.adapter.out.persistence.entity.UserJpaEntity
import com.gmin.serverstandard.application.domain.model.User
import org.springframework.stereotype.Component

@Component
class UserMapper {
    /**
     * UserJpaEntity를 도메인 엔티티인 User로 매핑합니다.
     *
     * @param userJpaEntity JPA 엔티티
     * @return 변환된 도메인 엔티티
     */
    fun mapToDomainEntity(
        userJpaEntity: UserJpaEntity,
    ): User {
        return User(
            companyId = userJpaEntity.companyId ?: 0,
            userId = userJpaEntity.userId ?: 0,
            username = userJpaEntity.username,
            email = userJpaEntity.email,
            passwordHash = userJpaEntity.passwordHash,
            createdAt = userJpaEntity.createdAt,
            updatedAt = userJpaEntity.updatedAt ?: userJpaEntity.createdAt,
            positionId = userJpaEntity.positionId,
            employmentStatus = userJpaEntity.employmentStatus,
            phoneNumber = userJpaEntity.phoneNumber
        )
    }

    /**
     * 도메인 엔티티인 User를 JPA 엔티티로 매핑합니다.
     *
     * @param user 도메인 엔티티
     * @return 변환된 JPA 엔티티
     */
    fun mapToJpaEntity(
        user: User
    ): UserJpaEntity {
        return UserJpaEntity(
            companyId = user.companyId,
            userId = if (user.userId == 0) null else user.userId,
            username = user.username,
            email = user.email,
            passwordHash = user.getHashedPassword(),
            createdAt = user.createdAt,
            updatedAt = user.updatedAt,
            positionId = user.positionId,
            employmentStatus = user.employmentStatus,
            phoneNumber = user.phoneNumber
        )
    }
}
