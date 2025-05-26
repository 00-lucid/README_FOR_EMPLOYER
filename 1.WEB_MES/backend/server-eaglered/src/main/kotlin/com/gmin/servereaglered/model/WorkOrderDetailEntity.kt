package com.gmin.servereaglered.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.springframework.format.annotation.DateTimeFormat
import java.io.Serializable
import java.time.LocalDateTime
import java.util.Date

/**
 * 복합 키 클래스
 */
@Embeddable
class WorkOrderDetailId(
    @Column(name = "WorkOrderNo")
    val workOrderNo: String,

    @Column(name = "WorkOrderSeq")
    val workOrderSeq: String,

) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is WorkOrderDetailId) return false

        if (workOrderNo != other.workOrderNo) return false
        if (workOrderSeq != other.workOrderSeq) return false

        return true
    }

    override fun hashCode(): Int {
        var result = workOrderNo.hashCode()
        result = 31 * result + workOrderNo.hashCode()
        return result
    }
}

@Entity
@Table(name = "WorkOrderDetail")
class WorkOrderDetailEntity(
    @EmbeddedId
    val id: WorkOrderDetailId,

    @Column(name = "CompCd", nullable = false, length = 8)
    val compCd: String,

    @Column(name = "StartTime")
    val startTime: Date?,

    @Column(name = "EndTime")
    val endTime: Date?,

    @Column(name = "MemberCd", nullable = false, length = 20)
    val memberCd: String,

    @Column(name = "ProcessCd", length = 40)
    val processCd: String?,

    @Column(name = "ItemCd", nullable = false, length = 40)
    val itemCd: String,

    @Column(name = "WorkQty", nullable = false)
    val workQty: Int,

    @Column(name = "EquiCd", length = 40)
    val equiCd: String?,

    @Column(name = "ComYn", length = 1)
    val comYn: String?,

    @Column(name = "DelYn", length = 1)
    val delYn: String?,

    @Column(name = "InputDate")
    val inputDate: Date?,

    @Column(name = "InputUser", length = 20)
    val inputUser: String?
)