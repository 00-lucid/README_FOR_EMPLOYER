package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.UpdateUserCommand

/**
 * 사용자 정보 업데이트 요청 DTO
 */
data class UpdateUserRequest(
    val username: String? = null,
    val email: String? = null,
    val positionId: Int? = null,
    val employmentStatus: String? = null,
    val phoneNumber: String? = null
) {
    /**
     * UpdateUserRequest를 UpdateUserCommand로 변환합니다.
     *
     * @param userId 업데이트할 사용자의 ID
     * @return 변환된 UpdateUserCommand 객체
     */
    fun toCommand(userId: Int): UpdateUserCommand {
        return UpdateUserCommand(
            userId = userId,
            username = username,
            email = email,
            positionId = positionId,
            employmentStatus = employmentStatus,
            phoneNumber = phoneNumber
        )
    }
}