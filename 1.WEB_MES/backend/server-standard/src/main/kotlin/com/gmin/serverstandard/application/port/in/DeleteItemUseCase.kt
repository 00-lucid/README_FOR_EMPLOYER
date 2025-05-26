package com.gmin.serverstandard.application.port.`in`

/**
 * 품목 삭제를 위한 유스케이스 인터페이스
 */
interface DeleteItemUseCase {
    /**
     * 특정 ID의 품목을 삭제합니다.
     *
     * @param itemId 삭제할 품목 ID
     * @return 삭제 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    fun deleteItem(itemId: Int): Result<Boolean>
}