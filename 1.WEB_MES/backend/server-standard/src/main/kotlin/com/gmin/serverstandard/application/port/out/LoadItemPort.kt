package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.Item
import java.util.Optional

/**
 * 품목 조회를 위한 포트 인터페이스
 */
interface LoadItemPort {
    /**
     * 모든 품목을 조회합니다.
     *
     * @return 모든 품목 목록 (Optional로 감싸져 있음)
     */
    fun findAll(): Optional<List<Item>>
    
    /**
     * 특정 ID의 품목을 조회합니다.
     *
     * @param itemId 조회할 품목 ID
     * @return 해당 ID의 품목 (Optional로 감싸져 있음)
     */
    fun findById(itemId: Int): Optional<Item>
    
    /**
     * 특정 회사의 품목을 조회합니다.
     *
     * @param companyId 조회할 회사 ID
     * @return 해당 회사의 품목 목록 (Optional로 감싸져 있음)
     */
    fun findByCompanyId(companyId: Int): Optional<List<Item>>
    
    /**
     * 특정 품목 타입의 품목을 조회합니다.
     *
     * @param itemType 조회할 품목 타입
     * @return 해당 타입의 품목 목록 (Optional로 감싸져 있음)
     */
    fun findByItemType(itemType: String): Optional<List<Item>>
}