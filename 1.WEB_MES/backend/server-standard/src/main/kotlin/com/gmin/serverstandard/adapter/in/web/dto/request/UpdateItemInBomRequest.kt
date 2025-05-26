package com.gmin.serverstandard.adapter.`in`.web.dto.request

import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive

/**
 * BOM 내 품목 수정 요청 데이터 전송 객체
 */
data class UpdateItemInBomRequest(
    @field:NotNull(message = "수량은 필수 입력 항목입니다.")
    @field:Positive(message = "수량은 양수여야 합니다.")
    val quantity: Double,
    
    val remark: String?,
    
    val parentItemId: Int?
)