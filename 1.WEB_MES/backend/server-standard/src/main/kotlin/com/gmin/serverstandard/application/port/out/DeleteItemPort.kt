package com.gmin.serverstandard.application.port.out

/**
 * 품목 삭제를 위한 포트 인터페이스
 */
interface DeleteItemPort {
    /**
     * 특정 ID의 품목을 삭제합니다.
     *
     * @param itemId 삭제할 품목 ID
     * @return 삭제 성공 여부
     */
    fun deleteById(itemId: Int): Boolean
}