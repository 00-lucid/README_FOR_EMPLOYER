package com.gmin.serverstandard.application.port.out

/**
 * 거래처 삭제를 위한 포트 인터페이스
 */
interface DeleteCorrespondentPort {
    /**
     * 특정 ID의 거래처를 삭제합니다.
     *
     * @param correspondentId 삭제할 거래처 ID
     * @return 삭제 성공 여부
     */
    fun deleteById(correspondentId: Int): Boolean
}