package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Correspondent
import com.gmin.serverstandard.application.port.`in`.command.UpdateCorrespondentCommand

/**
 * 거래처 수정을 위한 유스케이스 인터페이스
 */
interface UpdateCorrespondentUseCase {
    /**
     * 기존 거래처를 수정합니다.
     *
     * @param command 거래처 수정에 필요한 데이터를 담은 커맨드 객체
     * @return 수정된 거래처 (성공/실패 여부를 포함한 Result 객체)
     */
    fun updateCorrespondent(command: UpdateCorrespondentCommand): Result<Correspondent>
}