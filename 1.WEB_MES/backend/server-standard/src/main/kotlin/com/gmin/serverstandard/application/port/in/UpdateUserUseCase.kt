package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.adapter.`in`.web.dto.UserDto
import com.gmin.serverstandard.application.port.`in`.command.UpdateUserCommand

interface UpdateUserUseCase {
    /**
     * 사용자 정보를 업데이트합니다.
     *
     * @param command 업데이트할 사용자 정보가 담긴 커맨드
     * @return 업데이트된 사용자 정보를 담은 Result 객체
     */
    fun updateUser(command: UpdateUserCommand): Result<UserDto>
}