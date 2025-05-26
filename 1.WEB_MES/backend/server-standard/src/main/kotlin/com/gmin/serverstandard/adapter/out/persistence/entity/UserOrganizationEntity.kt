package com.gmin.serverstandard.adapter.out.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.IdClass
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.io.Serializable

/**
 * 사용자-조직 관계를 위한 복합 키 클래스
 */
class UserOrganizationId(
    var userId: Int = 0,
    var organizationId: Int = 0
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as UserOrganizationId

        if (userId != other.userId) return false
        if (organizationId != other.organizationId) return false

        return true
    }

    override fun hashCode(): Int {
        var result = userId
        result = 31 * result + organizationId
        return result
    }
}

/**
 * 사용자-조직 관계 엔티티
 */
@Entity
@Table(name = "UserOrganizations")
@IdClass(UserOrganizationId::class)
class UserOrganizationEntity(
    @Id
    @Column(name = "UserId")
    val userId: Int,

    @Id
    @Column(name = "OrganizationId")
    val organizationId: Int,

    @ManyToOne
    @JoinColumn(name = "UserId", insertable = false, updatable = false)
    val user: UserJpaEntity? = null,

    @ManyToOne
    @JoinColumn(name = "OrganizationId", insertable = false, updatable = false)
    val organization: OrganizationEntity? = null
)