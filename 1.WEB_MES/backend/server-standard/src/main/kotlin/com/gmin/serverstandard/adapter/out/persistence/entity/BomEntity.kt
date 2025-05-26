package com.gmin.serverstandard.adapter.out.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "Boms")
class BomEntity(
    @Column(name = "BomStatus", nullable = false, length = 10)
    val bomStatus: String,
    
    @Column(name = "BomVersion", nullable = false, length = 10)
    val bomVersion: String,
    
    @Column(name = "Remark", columnDefinition = "nvarchar(max)")
    val remark: String?,
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "BomId")
    val bomId: Int? = null,
    
    @Column(name = "CreatedAt", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "UpdatedAt", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)