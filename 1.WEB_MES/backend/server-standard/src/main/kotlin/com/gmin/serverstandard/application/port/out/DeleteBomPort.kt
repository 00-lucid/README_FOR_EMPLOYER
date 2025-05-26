package com.gmin.serverstandard.application.port.out

/**
 * BOM 삭제를 위한 포트 인터페이스
 */
interface DeleteBomPort {
    /**
     * 특정 ID의 BOM을 삭제합니다.
     *
     * @param bomId 삭제할 BOM ID
     * @return 삭제 성공 여부
     */
    fun deleteById(bomId: Int): Boolean
}