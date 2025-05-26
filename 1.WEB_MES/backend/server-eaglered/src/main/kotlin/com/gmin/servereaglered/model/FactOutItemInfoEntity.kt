package com.gmin.servereaglered.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.io.Serializable
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.Date
import java.util.Objects

/**
 * 복합 키 클래스
 */
@Embeddable
class FactOutItemInfoId(
    @Column(name = "WorkOrderNo", nullable = false, length = 40)
    val workOrderNo: String,

    @Column(name = "WorkOrderSeq", nullable = false)
    val workOrderSeq: Int,

    @Column(name = "OutSeq", nullable = false)
    val outSeq: Int

    ) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as FactOutItemInfoId

        if (workOrderNo != other.workOrderNo) return false
        if (workOrderSeq != other.workOrderSeq) return false
        if (outSeq != other.outSeq) return false

        return true
    }

    override fun hashCode(): Int {
        return Objects.hash(workOrderNo, workOrderSeq, outSeq)
    }
}

@Entity
@Table(name = "FactOutItemInfo")
class FactOutItemInfoEntity(
    @EmbeddedId
    val id: FactOutItemInfoId,

    @Column(name = "CompCd", nullable = false, length = 8)
    val compCd: String,

    @Column(name = "PerformNo", length = 20) // nullable = true (기본값)
    val performNo: String?,

    @Column(name = "OutType", nullable = false, length = 10)
    val outType: String,

    @Column(name = "OutItemCd", nullable = false, length = 40)
    val outItemCd: String,

    @Column(name = "OutQty", nullable = false, precision = 18, scale = 2)
    val outQty: BigDecimal,

    @Column(name = "StkNo", nullable = false, length = 40)
    val stkNo: String,

    @Column(name = "Remk", length = 200) // nullable = true (기본값)
    val remk: String?, // Nullable String

    @Column(name = "DelYn", nullable = false, length = 1) // 길이 명시 (nvarchar(1)로 가정)
    val delYn: String, // DDL 기반으로 not null

    @Column(name = "InputDate", nullable = false)
    val inputDate: LocalDateTime, // datetime -> LocalDateTime 매핑

    @Column(name = "InputUser", nullable = false, length = 20)
    val inputUser: String,
)