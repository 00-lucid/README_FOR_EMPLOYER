package com.gmin.serverstandard.adapter.out.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "Users")
class UserJpaEntity(
    @Column(name = "CompanyId")
    val companyId: Int,

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserId")
    val userId: Int? = null,

    @Column(name = "Username")
    val username: String,

    @Column(name = "Email")
    val email: String,

    @Column(name = "PasswordHash")
    val passwordHash: String,

    @Column(name = "CreatedAt")
    val createdAt: LocalDateTime,

    @Column(name = "UpdatedAt")
    val updatedAt: LocalDateTime? = null,

    @Column(name = "PositionId")
    val positionId: Int = 1,

    @Column(name = "EmploymentStatus")
    val employmentStatus: String = "재직중",

    @Column(name = "PhoneNumber")
    val phoneNumber: String? = null
)
