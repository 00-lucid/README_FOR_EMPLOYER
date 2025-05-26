package com.gmin.servereaglered.model // 패키지명은 실제 프로젝트 구조에 맞게 조정하세요

import jakarta.persistence.*
import java.io.Serializable
import java.util.Date // java.time.LocalDateTime 사용을 고려해볼 수 있습니다.

/**
 * StockTransMaster 테이블의 복합 기본 키 클래스
 */
@Embeddable
class StockTransMasterId(
    @Column(name = "StkNo", columnDefinition = "nvarchar(40)", nullable = false)
    var stkNo: String
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as StockTransMasterId

        if (stkNo != other.stkNo) return false

        return true
    }

    override fun hashCode(): Int {
        var result = stkNo.hashCode()
        return result
    }
}

/**
 * StockTransMaster 테이블과 매핑되는 엔티티 클래스
 */
@Entity
@Table(name = "StockTransMaster")
class StockTransMasterEntity(
    @EmbeddedId
    val id: StockTransMasterId,

    @Column(name = "CompCd", columnDefinition = "nvarchar(8)", nullable = false)
    val compCd: String,

    @Column(name = "StkDate", columnDefinition = "nvarchar(10)", nullable = false)
    val stkDate: String,

    @Column(name = "StkType", columnDefinition = "nvarchar(10)", nullable = false)
    val stkType: String,

    @Column(name = "WarehouseCd", columnDefinition = "nvarchar(40)", nullable = false)
    val warehouseCd: String,

    @Column(name = "Remk", columnDefinition = "nvarchar(200)") // nullable = true는 기본값
    val remk: String?,

    @Column(name = "DelYn", columnDefinition = "nvarchar", nullable = false) // SQL 정의에 nvarchar 길이를 명시하는 것이 좋습니다. (예: nvarchar(1))
    val delYn: String,

    @Column(name = "InputDate", nullable = false) // datetime 타입은 @Temporal(TemporalType.TIMESTAMP) 를 추가하거나 Hibernate가 자동으로 매핑하도록 둘 수 있습니다.
    @Temporal(TemporalType.TIMESTAMP)
    val inputDate: Date,

    @Column(name = "InputUser", columnDefinition = "nvarchar(20)", nullable = false)
    val inputUser: String
)