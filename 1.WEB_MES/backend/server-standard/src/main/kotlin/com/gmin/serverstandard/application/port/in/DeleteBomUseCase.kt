package com.gmin.serverstandard.application.port.`in`

/**
 * BOM 삭제를 위한 유스케이스 인터페이스
 */
interface DeleteBomUseCase {
    /**
     * 특정 ID의 BOM을 삭제합니다.
     *
     * @param bomId 삭제할 BOM ID
     * @return 삭제 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    fun deleteBom(bomId: Int): Result<Boolean>
}