package com.gmin.servereaglered.model

import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.Table
import java.io.Serializable
import java.util.Date

/**
 * 복합 키 클래스
 */
@Embeddable
class WorkOrderMasterId(
    @Column(name = "PrdReqNo", columnDefinition = "nvarchar(40)", nullable = false)
    val prdReqNo: String,

    @Column(name = "PrdPlanNo", columnDefinition = "nvarchar(40)", nullable = false)
    val prdPlanNo: String,

    @Column(name = "WorkOrderNo", columnDefinition = "nvarchar(40)", nullable = false)
    val workOrderNo: String

) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is WorkOrderMasterId) return false

        if (prdReqNo != other.prdReqNo) return false
        if (prdPlanNo != other.prdPlanNo) return false
        if (workOrderNo != other.workOrderNo) return false // 수정: 오타 수정 (other.prdPlanNo -> other.workOrderNo)

        return true
    }

    override fun hashCode(): Int {
        var result = prdReqNo.hashCode()
        result = 31 * result + prdPlanNo.hashCode()
        result = 31 * result + workOrderNo.hashCode()
        return result
    }
}

@Entity
@Table(name = "WorkOrderMaster")
class WorkOrderMasterEntity(
    @EmbeddedId
    val id: WorkOrderMasterId,

    @Column(name = "CompCd", columnDefinition = "nvarchar(8)")
    val compCd: String?,

    @Column(name = "WorkOrderDate", columnDefinition = "nvarchar(10)") // 수정: 컬럼명 대소문자 수정
    val workOrderDate: String?,

    @Column(name = "LotSize")
    val lotSize: Int?,

    @Column(name = "DelYn", columnDefinition = "nvarchar(1)")
    val delYn: String?,

    @Column(name = "InputDate")
    val inputDate: Date?,

    @Column(name = "InputUser", columnDefinition = "nvarchar(20)")
    val inputUser: String?,
)