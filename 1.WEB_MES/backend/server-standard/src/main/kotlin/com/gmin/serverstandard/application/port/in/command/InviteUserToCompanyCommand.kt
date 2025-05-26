package com.gmin.serverstandard.application.port.`in`.command

/**
 * 사용자를 회사에 초대하기 위한 커맨드 클래스
 */
data class InviteUserToCompanyCommand(
    val email: String,
    val companyId: Int
)