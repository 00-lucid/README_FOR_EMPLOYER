package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Item
import com.gmin.serverstandard.application.port.`in`.command.CreateItemCommand

/**
 * 품목 생성을 위한 유스케이스 인터페이스
 */
interface CreateItemUseCase {
    /**
     * 새로운 품목을 생성합니다.
     *
     * @param command 품목 생성에 필요한 데이터를 담은 커맨드 객체
     * @return 생성된 품목 (성공/실패 여부를 포함한 Result 객체)
     */
    fun createItem(command: CreateItemCommand): Result<Item>
}