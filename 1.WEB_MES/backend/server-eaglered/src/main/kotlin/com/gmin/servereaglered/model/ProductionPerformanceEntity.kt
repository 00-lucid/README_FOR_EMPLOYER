package com.gmin.servereaglered.model

import com.gmin.serverstandard.adapter.`in`.web.dto.ProductionPerformanceDto
import com.gmin.serverstandard.application.port.`in`.command.ProductionPerformanceCommand
import jakarta.persistence.*
import java.io.Serializable
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Date

/**
 * 복합 키 클래스
 */
@Embeddable
class ProductionPerformanceId(
    @Column(name = "WorkOrderNo", columnDefinition = "nvarchar(40)", nullable = false)
    val workOrderNo: String,

    @Column(name = "WorkOrderSeq", nullable = false)
    val workOrderSeq: Int,

    @Column(name = "PerformNo", columnDefinition = "nvarchar(20)", nullable = false)
    val performNo: String
) : Serializable {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is ProductionPerformanceId) return false

        if (workOrderNo != other.workOrderNo) return false
        if (workOrderSeq != other.workOrderSeq) return false
        if (performNo != other.performNo) return false

        return true
    }

    override fun hashCode(): Int {
        var result = workOrderNo.hashCode()
        result = 31 * result + workOrderSeq.hashCode()
        result = 31 * result + performNo.hashCode()
        return result
    }
}

/**
 * 생산 실적 엔티티
 * 데이터베이스의 생산 실적 테이블과 매핑됩니다.
 */
@Entity
@Table(name = "WorkPerform")
class ProductionPerformanceEntity(
    @EmbeddedId
    val id: ProductionPerformanceId,

    @Column(name = "CompCd", columnDefinition = "nvarchar(8)")
    val compCd: String?,

    @Column(name = "LotNo", columnDefinition = "nvarchar(40)")
    val lotNo: String?,

    @Column(name = "MemberCd", columnDefinition = "nvarchar(20)")
    val memberCd: String?,

    @Column(name = "WorkDate")
    val workDate: Date,

    @Column(name = "ItemCd", columnDefinition = "nvarchar(40)")
    val itemCd: String?,

    @Column(name = "MakeQty", precision = 18, scale = 4)
    val makeQty: BigDecimal,

    @Column(name = "MakeOkQty", precision = 18, scale = 4)
    val makeOkQty: BigDecimal,

    @Column(name = "MakeBadQty", precision = 18, scale = 4)
    val makeBadQty: BigDecimal,

    @Column(name = "BadType", columnDefinition = "nvarchar(20)")
    val badType: String?,

    @Column(name = "BadReason", columnDefinition = "nvarchar(50)")
    val badReason: String?,

    @Column(name = "StkNo", columnDefinition = "nvarchar(255)")
    val stkNo: String?,

    @Column(name = "Remk", columnDefinition = "nvarchar(255)")
    val remk: String?,

    @Column(name = "DelYn", columnDefinition = "nvarchar", nullable = false)
    val delYn: String = "N",

    @Column(name = "InputDate")
    val inputDate: Date?,

    @Column(name = "InputUser", columnDefinition = "nvarchar(255)")
    val inputUser: String?
) {
    /**
     * Entity를 DTO로 변환하는 메서드
     *
     * @return 변환된 ProductionPerformanceDto 객체
     */
    fun toDto(): ProductionPerformanceDto {
        return ProductionPerformanceDto(
            workOrderNo = this.id.workOrderNo,
            workOrderSeq = this.id.workOrderSeq.toString(),
            perfromNo = this.id.performNo,
            compCd = this.compCd ?: "",
            lotNo = this.lotNo ?: "",
            memberCd = this.memberCd ?: "",
            workDate = this.workDate,
            itemCd = this.itemCd ?: "",
            makeQty = this.makeQty.toInt(),
            makeOkQty = this.makeOkQty.toInt(),
            makeBadQty = this.makeBadQty.toInt(),
            badType = this.badType,
            badReason = this.badReason,
            stkNo = this.stkNo,
            remk = this.remk,
            delYn = this.delYn,
            inputDate = this.inputDate?.toString(),
            inputUser = this.inputUser
        )
    }

    companion object {
        /**
         * DTO를 Entity로 변환하는 메서드
         *
         * @param dto 변환할 ProductionPerformanceDto 객체
         * @return 변환된 ProductionPerformanceEntity 객체
         */
        fun fromDto(dto: ProductionPerformanceDto): ProductionPerformanceEntity {
            // 복합키 생성
            val id = ProductionPerformanceId(
                workOrderNo = dto.workOrderNo,
                workOrderSeq = dto.workOrderSeq.toInt(),
                performNo = dto.perfromNo
            )

            return ProductionPerformanceEntity(
                id = id,
                compCd = dto.compCd,
                lotNo = dto.lotNo,
                memberCd = dto.memberCd,
                workDate = dto.workDate,
                itemCd = dto.itemCd,
                makeQty = BigDecimal(dto.makeQty),
                makeOkQty = BigDecimal(dto.makeOkQty),
                makeBadQty = BigDecimal(dto.makeBadQty),
                badType = dto.badType,
                badReason = dto.badReason,
                stkNo = dto.stkNo,
                remk = dto.remk,
                delYn = dto.delYn ?: "N",
                inputDate = dto.inputDate?.let { Date() }, // 날짜 문자열을 Date로 변환
                inputUser = dto.inputUser
            )
        }

        /**
         * Command 객체를 Entity로 변환하는 새로운 메서드
         *
         * @param command 변환할 ProductionPerformanceCommand 객체
         * @return 변환된 ProductionPerformanceEntity 객체
         */
        fun fromCommand(command: ProductionPerformanceCommand, performNo: String, lotNo: String): ProductionPerformanceEntity {
            // 복합키 생성
            val id = ProductionPerformanceId(
                workOrderNo = command.workOrderNumber,
                workOrderSeq = command.workOrderSequence,
                performNo = performNo
            )

            // 양품, 불량 수량을 BigDecimal로 변환
            val goodQtyDecimal = BigDecimal(command.goodQuantity)
            val badQtyDecimal = BigDecimal(command.badQuantity)
            // 총 생산량 계산
            val totalQtyDecimal = goodQtyDecimal + badQtyDecimal


            return ProductionPerformanceEntity(
                id = id,
                compCd = "1500", // Command에 CompCd 정보가 없으므로 null 또는 기본값 설정 필요
                lotNo = lotNo,
                memberCd = command.memberCode,
                workDate = Date(),
                itemCd = command.itemCode,
                makeQty = totalQtyDecimal, // 계산된 총 생산량
                makeOkQty = goodQtyDecimal, // 양품 수량
                makeBadQty = badQtyDecimal, // 불량 수량
                badType = command.badType,
                badReason = command.badReason,
                stkNo = null,
                remk = command.note,
                delYn = "N", // 기본값 "N"
                inputDate = Date(), // 현재 시간으로 설정
                inputUser = command.memberCode // Command에 사용자 정보가 없으므로 null 또는 기본값/세션 정보 활용 필요
            )
        }
    }
}