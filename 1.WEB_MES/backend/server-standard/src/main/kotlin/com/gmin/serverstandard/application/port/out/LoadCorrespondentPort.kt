package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.Correspondent
import java.util.Optional

/**
 * 거래처 조회를 위한 포트 인터페이스
 */
interface LoadCorrespondentPort {
    /**
     * 모든 거래처를 조회합니다.
     *
     * @return 모든 거래처 목록 (Optional로 감싸져 있음)
     */
    fun findAll(): Optional<List<Correspondent>>

    /**
     * 특정 ID의 거래처를 조회합니다.
     *
     * @param correspondentId 조회할 거래처 ID
     * @return 해당 ID의 거래처 (Optional로 감싸져 있음)
     */
    fun findById(correspondentId: Int): Optional<Correspondent>

    /**
     * 특정 타입의 거래처를 조회합니다.
     *
     * @param type 조회할 거래처 타입
     * @return 해당 타입의 거래처 목록 (Optional로 감싸져 있음)
     */
    fun findByType(type: String): Optional<List<Correspondent>>
}