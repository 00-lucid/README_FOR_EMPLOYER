package com.gmin.servereaglered.model // 패키지명은 실제 프로젝트 구조에 맞게 조정하세요

import jakarta.persistence.*
import java.io.Serializable
import java.math.BigDecimal
import java.util.Date

/**
 * StockTransDetail 테이블의 복합 기본 키 클래스
 */
@Embeddable
class StockTransDetailId(
    @Column(name = "StkNo", columnDefinition = "nvarchar(40)", nullable = false)
    var stkNo: String,

    @Column(name = "StkSeq", nullable = false)
    var stkSeq: Int
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as StockTransDetailId

        if (stkNo != other.stkNo) return false
        if (stkSeq != other.stkSeq) return false

        return true
    }

    override fun hashCode(): Int {
        var result = stkNo.hashCode()
        result = 31 * result + stkSeq
        return result
    }
}

/**
 * StockTransDetail 테이블과 매핑되는 엔티티 클래스
 */
@Entity
@Table(name = "StockTransDetail")
class StockTransDetailEntity(
    @EmbeddedId
    val id: StockTransDetailId,

    @Column(name = "CompCd", columnDefinition = "nvarchar(8)", nullable = false)
    val compCd: String,

    @Column(name = "ItemCd", columnDefinition = "nvarchar(40)", nullable = false)
    val itemCd: String,

    @Column(name = "TransQty", precision = 18, scale = 4, nullable = false)
    val transQty: BigDecimal,

    @Column(name = "DelYn", columnDefinition = "nvarchar", nullable = false) // SQL 정의에 길이를 명시하는 것이 좋습니다. (예: nvarchar(1))
    val delYn: String,

    @Column(name = "InputDate", nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    val inputDate: Date,

    @Column(name = "InputUser", columnDefinition = "nvarchar(20)", nullable = false)
    val inputUser: String
)