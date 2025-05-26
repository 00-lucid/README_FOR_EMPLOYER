package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.CreateBomCommand
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Positive

/**
 * BOM 생성 요청 데이터 전송 객체
 */
data class CreateBomRequest(
    val bomStatus: String,

    val bomVersion: String,

    val remark: String?,

    val items: List<BomItemRequest>? = null
) {
    /**
     * 요청 DTO를 명령 객체로 변환합니다.
     *
     * @return 변환된 명령 객체
     */
    fun toCommand(): CreateBomCommand {
        return CreateBomCommand(
            bomStatus = bomStatus,
            bomVersion = bomVersion,
            remark = remark
        )
    }
}

/**
 * BOM 생성 시 추가할 품목 요청 데이터 전송 객체
 */
data class BomItemRequest(
    @field:NotNull(message = "품목 ID는 필수 입력 항목입니다.")
    @field:Positive(message = "품목 ID는 양수여야 합니다.")
    val itemId: Int,

    @field:NotNull(message = "수량은 필수 입력 항목입니다.")
    @field:Positive(message = "수량은 양수여야 합니다.")
    val quantity: Double,

    val remark: String?,

    val parentItemId: Int?
)
