package com.gmin.serverstandard.application.port.`in`

/**
 * 거래처 삭제를 위한 유스케이스 인터페이스
 */
interface DeleteCorrespondentUseCase {
    /**
     * 특정 ID의 거래처를 삭제합니다.
     *
     * @param correspondentId 삭제할 거래처 ID
     * @return 삭제 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    fun deleteCorrespondent(correspondentId: Int): Result<Boolean>
}