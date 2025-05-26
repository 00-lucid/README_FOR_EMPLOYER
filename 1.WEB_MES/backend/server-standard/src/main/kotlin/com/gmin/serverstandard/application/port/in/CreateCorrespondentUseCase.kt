package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Correspondent
import com.gmin.serverstandard.application.port.`in`.command.CreateCorrespondentCommand

/**
 * 거래처 생성을 위한 유스케이스 인터페이스
 */
interface CreateCorrespondentUseCase {
    /**
     * 새로운 거래처를 생성합니다.
     *
     * @param command 거래처 생성에 필요한 데이터를 담은 커맨드 객체
     * @return 생성된 거래처 (성공/실패 여부를 포함한 Result 객체)
     */
    fun createCorrespondent(command: CreateCorrespondentCommand): Result<Correspondent>
}