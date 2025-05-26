package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.Item

/**
 * 품목 저장을 위한 포트 인터페이스
 */
interface SaveItemPort {
    /**
     * 품목을 저장합니다. (생성 또는 수정)
     *
     * @param item 저장할 품목 도메인 엔티티
     * @return 저장된 품목 도메인 엔티티
     */
    fun save(item: Item): Item
}