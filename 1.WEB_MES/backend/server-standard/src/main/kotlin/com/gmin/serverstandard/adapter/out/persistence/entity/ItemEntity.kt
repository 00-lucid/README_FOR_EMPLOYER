package com.gmin.serverstandard.adapter.out.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "Items")
class ItemEntity(
    @Column(name = "ItemName", nullable = false, length = 100)
    val itemName: String,
    
    @Column(name = "ItemType", nullable = false, length = 20)
    val itemType: String,
    
    @Column(name = "Unit", nullable = false, length = 10)
    val unit: String,
    
    @Column(name = "SalePrice", nullable = false)
    val salePrice: Double,
    
    @Column(name = "ItemPhotoUri", columnDefinition = "nvarchar(max)")
    val itemPhotoUri: String?,
    
    @Column(name = "CompanyId", nullable = false)
    val companyId: Int,
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ItemId")
    val itemId: Int? = null,
    
    @Column(name = "CreatedAt", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "UpdatedAt", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)