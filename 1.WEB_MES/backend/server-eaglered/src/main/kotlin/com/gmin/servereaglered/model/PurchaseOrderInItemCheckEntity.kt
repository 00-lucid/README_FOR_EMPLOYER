package com.gmin.servereaglered.model

import com.gmin.serverstandard.adapter.`in`.web.dto.IncomingInspectionDto
import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.io.Serializable
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Date

/**
 * 복합 키 클래스 (주문번호 + 주문순번)
 */
@Embeddable
class PurchaseOrderInItemCheckId(
    @Column(name = "POrderNo", length = 20)
    val pOrderNo: String,

    @Column(name = "POrderSeq")
    val pOrderSeq: Int
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is PurchaseOrderInItemCheckId) return false

        if (pOrderNo != other.pOrderNo) return false
        if (pOrderSeq != other.pOrderSeq) return false

        return true
    }

    override fun hashCode(): Int {
        var result = pOrderNo.hashCode()
        result = 31 * result + pOrderSeq
        return result
    }
}

/**
 * 입고 검사 엔티티
 * 데이터베이스의 입고 검사 테이블과 매핑됩니다.
 */
@Entity
@Table(name = "PurchaseOrderInItemCheck")
class PurchaseOrderInItemCheckEntity(
    @EmbeddedId
    val id: PurchaseOrderInItemCheckId,

    @Column(name = "CompCd", length = 10, nullable = false)
    val compCd: String,

    @Column(name = "ItemCd",  columnDefinition = "nvarchar(40)", nullable = false)
    val itemCd: String,

    @Column(name = "Std", length = 100)
    val std: String?,

    @Column(name = "Unit", length = 10)
    val unit: String?,

    @Column(name = "OrdQty")
    val ordQty: Int,

    @Column(name = "OrdPerson", columnDefinition = "nvarchar(20)")
    val ordPerson: String?,

    @Column(name = "InspectionDate")
    val inspectionDate: LocalDateTime?,

    @Column(name = "Inspector", columnDefinition = "nvarchar(20)")
    val inspector: String?,

    @Column(name = "Note", columnDefinition = "nvarchar(max)")
    val note: String?,

    @Column(name = "IsApproved")
    val isApproved: Boolean,

    @Column(name = "InputDate")
    val inputDate: LocalDateTime,

    @Column(name = "InputUser", columnDefinition = "nvarchar(255)")
    val inputUser: String,

    @Column(name = "BadQty", nullable = false)
    val badQty: Int = 0,
) {
    /**
     * Entity를 DTO로 변환하는 메서드
     *
     * @return 변환된 IncomingInspectionDto 객체
     */
    fun toDto(): IncomingInspectionDto {
        return IncomingInspectionDto(
            compCd = this.compCd,
            purchaseOrderNo = this.id.pOrderNo,
            purchaseOrderSeq = this.id.pOrderSeq,
            itemCd = this.itemCd,
            std = this.std,
            unit = this.unit,
            ordQty = this.ordQty,
            ordPerson = this.ordPerson,
            inspectionDate = this.inspectionDate,
            inspector = this.inspector,
            note = this.note,
            isApproved = this.isApproved,
            inputDate = this.inputDate,
            inputUser = this.inputUser,
            badQty = this.badQty,
        )
    }
}
