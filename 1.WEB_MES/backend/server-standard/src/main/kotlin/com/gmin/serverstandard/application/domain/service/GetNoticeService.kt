package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Notice
import com.gmin.serverstandard.application.port.`in`.GetNoticeUseCase
import com.gmin.serverstandard.application.port.out.LoadNoticePort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@UseCase
@Service
@Transactional
class GetNoticeService(
    val loadNoticePort: LoadNoticePort
): GetNoticeUseCase {
    /**
     * 특정 회사의 공지사항을 조회합니다.
     *
     * @param companyId 조회할 회사 ID
     * @return 해당 회사의 공지사항 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getNoticesByCompanyId(companyId: Int): Result<List<Notice>> {
        val noticesOptional = loadNoticePort.findByCompanyId(companyId)

        return if (noticesOptional.isEmpty) {
            Result.success(emptyList()) // 공지사항이 없는 경우 빈 리스트 반환
        } else {
            try {
                Result.success(noticesOptional.get())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}