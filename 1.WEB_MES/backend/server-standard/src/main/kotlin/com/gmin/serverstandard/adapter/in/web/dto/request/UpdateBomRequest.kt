package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.UpdateBomCommand
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern

/**
 * BOM 수정 요청 데이터 전송 객체
 */
data class UpdateBomRequest(
    val bomStatus: String,
    
    val bomVersion: String,
    
    val remark: String?
) {
    /**
     * 요청 DTO를 명령 객체로 변환합니다.
     *
     * @param bomId BOM ID
     * @return 변환된 명령 객체
     */
    fun toCommand(bomId: Int): UpdateBomCommand {
        return UpdateBomCommand(
            bomId = bomId,
            bomStatus = bomStatus,
            bomVersion = bomVersion,
            remark = remark
        )
    }
}