package com.gmin.serverstandard.adapter.`in`.web.dto.request

import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive

/**
 * BOM에 품목 추가 요청 데이터 전송 객체
 */
data class AddItemToBomRequest(
    @field:NotNull(message = "품목 ID는 필수 입력 항목입니다.")
    @field:Positive(message = "품목 ID는 양수여야 합니다.")
    val itemId: Int,
    
    @field:NotNull(message = "수량은 필수 입력 항목입니다.")
    @field:Positive(message = "수량은 양수여야 합니다.")
    val quantity: Double,
    
    val remark: String?,
    
    val parentItemId: Int?
)