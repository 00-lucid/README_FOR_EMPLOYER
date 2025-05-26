package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.Correspondent

/**
 * 거래처 저장을 위한 포트 인터페이스
 */
interface SaveCorrespondentPort {
    /**
     * 거래처를 저장합니다. (생성 또는 수정)
     *
     * @param correspondent 저장할 거래처 도메인 엔티티
     * @return 저장된 거래처 도메인 엔티티
     */
    fun save(correspondent: Correspondent): Correspondent
}