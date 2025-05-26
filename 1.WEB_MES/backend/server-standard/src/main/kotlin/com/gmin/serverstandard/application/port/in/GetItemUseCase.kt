package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Item

/**
 * 품목 조회를 위한 유스케이스 인터페이스
 */
interface GetItemUseCase {
    /**
     * 모든 품목을 조회합니다.
     *
     * @return 모든 품목 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getAllItems(): Result<List<Item>>
    
    /**
     * 특정 ID의 품목을 조회합니다.
     *
     * @param itemId 조회할 품목 ID
     * @return 해당 ID의 품목 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getItemById(itemId: Int): Result<Item>
    
    /**
     * 특정 회사의 품목을 조회합니다.
     *
     * @param companyId 조회할 회사 ID
     * @return 해당 회사의 품목 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getItemsByCompanyId(companyId: Int): Result<List<Item>>
    
    /**
     * 특정 품목 타입의 품목을 조회합니다.
     *
     * @param itemType 조회할 품목 타입
     * @return 해당 타입의 품목 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getItemsByType(itemType: String): Result<List<Item>>
}