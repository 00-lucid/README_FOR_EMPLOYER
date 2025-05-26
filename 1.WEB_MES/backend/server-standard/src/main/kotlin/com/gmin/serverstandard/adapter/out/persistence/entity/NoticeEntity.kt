package com.gmin.serverstandard.adapter.out.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.Date

@Entity
@Table(name = "Notices")
class NoticeEntity(
    @Column(name = "CompanyId")
    val companyId: Int,

    @Column(name = "Title")
    val title: String,

    @Column(name = "Content")
    val content: String,

    @Column(name = "IsPinned")
    val isPinned: Boolean = false,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NoticeId")
    val noticeId: Int? = null,

    @Column(name = "CreatedAt")
    val createdAt: Date = Date.from(LocalDateTime.now().toInstant(java.time.ZoneOffset.UTC)),

    @Column(name = "UpdatedAt")
    val updatedAt: Date = Date.from(LocalDateTime.now().toInstant(java.time.ZoneOffset.UTC)),
)