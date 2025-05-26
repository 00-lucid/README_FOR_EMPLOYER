package com.gmin.serverstandard.application.port.`in`.command

import com.gmin.serverstandard.application.domain.model.Bom

/**
 * BOM 수정 명령 클래스
 *
 * BOM 수정에 필요한 데이터를 담고 있는 명령 객체입니다.
 */
data class UpdateBomCommand(
    val bomId: Int,
    val bomStatus: String,
    val bomVersion: String,
    val remark: String?
) {
    /**
     * 명령의 유효성을 검사합니다.
     *
     * @return 유효성 검사 결과 (성공/실패 여부를 포함한 Result 객체)
     */
    fun validate(): Result<UpdateBomCommand> {
        // BOM ID 유효성 검사
        if (bomId <= 0) {
            return Result.failure(IllegalArgumentException("유효하지 않은 BOM ID입니다: $bomId"))
        }
        
        // BOM 상태 유효성 검사
        if (!Bom.isValidBomStatus(bomStatus)) {
            return Result.failure(IllegalArgumentException("유효하지 않은 BOM 상태입니다: $bomStatus"))
        }
        
        // BOM 버전 유효성 검사 (비어있지 않은지 확인)
        if (bomVersion.isBlank()) {
            return Result.failure(IllegalArgumentException("BOM 버전은 필수 입력 항목입니다."))
        }
        
        return Result.success(this)
    }
}