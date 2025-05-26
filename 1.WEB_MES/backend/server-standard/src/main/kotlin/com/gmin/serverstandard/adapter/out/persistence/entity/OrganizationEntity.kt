package com.gmin.serverstandard.adapter.out.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.LocalDateTime

@Entity
@Table(name = "Organizations")
class OrganizationEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "OrganizationId")
    val organizationId: Int? = null,

    @Column(name = "OrganizationName", nullable = false)
    val organizationName: String,

    @Column(name = "CreatedAt", nullable = false)
    val createdAt: LocalDateTime,

    @Column(name = "UpdatedAt", nullable = false)
    val updatedAt: LocalDateTime,

    @Column(name = "ParentOrganizationId", nullable = true)
    val parentOrganizationId: Int? = null,

    @Column(name = "CompanyId")
    val companyId: Int? = null,

    @OneToMany(mappedBy = "organization")
    val userOrganizations: MutableList<UserOrganizationEntity> = mutableListOf()
)
