package com.gmin.serverstandard.adapter.out.persistence.adapter

import com.gmin.serverstandard.adapter.out.persistence.mapper.NoticeMapper
import com.gmin.serverstandard.adapter.out.persistence.repository.SpringDataNoticeRepository
import com.gmin.serverstandard.application.domain.model.Notice
import com.gmin.serverstandard.application.port.out.LoadNoticePort
import org.springframework.stereotype.Component
import java.util.Optional

@Component
class NoticePersistenceAdapter(
    private val noticeRepository: SpringDataNoticeRepository,
    private val noticeMapper: NoticeMapper
): LoadNoticePort {
    /**
     * 특정 회사 ID로 공지사항을 검색합니다.
     *
     * @param companyId 검색할 회사 ID
     * @return 해당 회사의 공지사항 목록 (Optional로 감싸져 있음)
     */
    override fun findByCompanyId(companyId: Int): Optional<List<Notice>> {
        val notices = noticeRepository.findByCompanyId(companyId)
        return if (notices != null && !notices.isEmpty()) {
            Optional.of(notices.map { noticeMapper.mapToDomainEntity(it) })
        } else {
            Optional.empty()
        }
    }
}