package com.gmin.serverstandard.adapter.out.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "Correspondents")
class CorrespondentEntity(
    @Column(name = "Name", nullable = false, length = 100)
    val name: String,
    
    @Column(name = "Type", nullable = false, length = 10)
    val type: String,
    
    @Column(name = "Ceo", nullable = false, length = 50)
    val ceo: String,
    
    @Column(name = "BusinessNumber", nullable = false, length = 20)
    val businessNumber: String,
    
    @Column(name = "PhoneNumber", nullable = false, length = 20)
    val phoneNumber: String,
    
    @Column(name = "Email", nullable = false, length = 100)
    val email: String,
    
    @Column(name = "Address", nullable = false, length = 255)
    val address: String,
    
    @Column(name = "DetailAddress", nullable = false, length = 255)
    val detailAddress: String,
    
    @Column(name = "Note", nullable = false, columnDefinition = "nvarchar(max)")
    val note: String,
    
    @Column(name = "CorrespondentPhotoUri", nullable = false, length = 255)
    val correspondentPhotoUri: String,
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CorrespondentId")
    val correspondentId: Int? = null,
    
    @Column(name = "CreatedAt", nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "UpdatedAt", nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)