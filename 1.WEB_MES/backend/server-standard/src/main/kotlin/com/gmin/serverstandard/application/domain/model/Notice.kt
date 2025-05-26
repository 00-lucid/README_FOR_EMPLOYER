package com.gmin.serverstandard.application.domain.model

import java.time.LocalDateTime
import java.util.Date

data class Notice(
    val noticeId: Int,
    val title: String,
    val content: String,
    val companyId: Int,
    val isPinned: Boolean,
    val createdAt: Date,
    val updatedAt: Date
)
