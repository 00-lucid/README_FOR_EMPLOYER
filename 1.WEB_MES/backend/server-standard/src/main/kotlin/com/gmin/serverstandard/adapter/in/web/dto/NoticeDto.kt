package com.gmin.serverstandard.adapter.`in`.web.dto

import com.gmin.serverstandard.application.domain.model.Notice
import java.time.LocalDateTime
import java.util.Date

/**
 * 공지사항 정보를 클라이언트에 전달하기 위한 DTO 클래스
 *
 * 공지사항의 모든 필요한 정보를 클라이언트에 제공합니다.
 */
data class NoticeDto(
    val noticeId: Int,
    val title: String,
    val content: String,
    val companyId: Int,
    val isPinned: Boolean,
    val createdAt: Date,
    val updatedAt: Date
) {
    companion object {
        /**
         * 도메인 엔티티인 Notice를 NoticeDto로 변환합니다.
         *
         * @param notice 변환할 도메인 엔티티
         * @return 생성된 NoticeDto 객체
         */
        fun fromDomain(notice: Notice): NoticeDto {
            return NoticeDto(
                noticeId = notice.noticeId,
                title = notice.title,
                content = notice.content,
                companyId = notice.companyId,
                isPinned = notice.isPinned,
                createdAt = notice.createdAt,
                updatedAt = notice.updatedAt
            )
        }
    }
}