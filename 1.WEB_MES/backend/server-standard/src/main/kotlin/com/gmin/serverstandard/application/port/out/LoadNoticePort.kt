package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.Notice
import java.util.Optional

interface LoadNoticePort {
    fun findByCompanyId(companyId: Int): Optional<List<Notice>>
}