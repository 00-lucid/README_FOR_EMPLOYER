package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Notice

interface GetNoticeUseCase {
    fun getNoticesByCompanyId(companyId: Int): Result<List<Notice>>
}