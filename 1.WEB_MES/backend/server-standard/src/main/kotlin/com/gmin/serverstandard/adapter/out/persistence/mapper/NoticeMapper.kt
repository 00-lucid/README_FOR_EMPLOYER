package com.gmin.serverstandard.adapter.out.persistence.mapper

import com.gmin.serverstandard.adapter.out.persistence.entity.NoticeEntity
import com.gmin.serverstandard.application.domain.model.Notice
import org.springframework.stereotype.Component

@Component
class NoticeMapper {
    /**
     * NoticeEntity를 도메인 엔티티인 Notice로 매핑합니다.
     *
     * @param noticeEntity JPA 엔티티
     * @return 변환된 도메인 엔티티
     */
    fun mapToDomainEntity(noticeEntity: NoticeEntity): Notice {
        return Notice(
            noticeId = noticeEntity.noticeId ?: -1,
            title = noticeEntity.title,
            content = noticeEntity.content,
            companyId = noticeEntity.companyId,
            isPinned = noticeEntity.isPinned,
            createdAt = noticeEntity.createdAt,
            updatedAt = noticeEntity.updatedAt
        )
    }

    /**
     * 도메인 엔티티인 Notice를 JPA 엔티티로 매핑합니다.
     *
     * @param notice 도메인 엔티티
     * @return 변환된 JPA 엔티티
     */
    fun mapToJpaEntity(notice: Notice): NoticeEntity {
        return NoticeEntity(
            noticeId = if (notice.noticeId == -1) null else notice.noticeId,
            title = notice.title,
            content = notice.content,
            companyId = notice.companyId,
            isPinned = notice.isPinned,
            createdAt = notice.createdAt,
            updatedAt = notice.updatedAt
        )
    }
}