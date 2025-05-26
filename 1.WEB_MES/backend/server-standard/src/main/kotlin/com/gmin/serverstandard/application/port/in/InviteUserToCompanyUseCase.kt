package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.adapter.`in`.web.dto.UserDto
import com.gmin.serverstandard.application.port.`in`.command.InviteUserToCompanyCommand

interface InviteUserToCompanyUseCase {
    /**
     * 이메일을 통해 사용자를 회사에 초대합니다.
     *
     * @param command 초대할 사용자의 이메일과 회사 ID가 담긴 커맨드
     * @return 초대된 사용자 정보를 담은 Result 객체
     */
    fun inviteUserToCompany(command: InviteUserToCompanyCommand): Result<UserDto>
}