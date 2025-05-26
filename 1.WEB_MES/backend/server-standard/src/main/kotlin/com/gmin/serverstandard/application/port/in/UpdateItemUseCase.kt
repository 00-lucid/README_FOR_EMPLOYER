package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Item
import com.gmin.serverstandard.application.port.`in`.command.UpdateItemCommand

/**
 * 품목 수정을 위한 유스케이스 인터페이스
 */
interface UpdateItemUseCase {
    /**
     * 기존 품목을 수정합니다.
     *
     * @param command 품목 수정에 필요한 데이터를 담은 커맨드 객체
     * @return 수정된 품목 (성공/실패 여부를 포함한 Result 객체)
     */
    fun updateItem(command: UpdateItemCommand): Result<Item>
}