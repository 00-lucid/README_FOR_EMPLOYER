package com.gmin.serverstandard.application.port.`in`.command

/**
 * 사용자 정보 업데이트를 위한 커맨드 클래스
 */
data class UpdateUserCommand(
    val userId: Int,
    val username: String? = null,
    val email: String? = null,
    val positionId: Int? = null,
    val employmentStatus: String? = null,
    val phoneNumber: String? = null
)