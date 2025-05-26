package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Correspondent

/**
 * 거래처 조회를 위한 유스케이스 인터페이스
 */
interface GetCorrespondentUseCase {
    /**
     * 모든 거래처를 조회합니다.
     *
     * @return 모든 거래처 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getAllCorrespondents(): Result<List<Correspondent>>

    /**
     * 특정 ID의 거래처를 조회합니다.
     *
     * @param correspondentId 조회할 거래처 ID
     * @return 해당 ID의 거래처 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getCorrespondentById(correspondentId: Int): Result<Correspondent>

    /**
     * 특정 타입의 거래처를 조회합니다.
     *
     * @param type 조회할 거래처 타입
     * @return 해당 타입의 거래처 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getCorrespondentsByType(type: String): Result<List<Correspondent>>
}