package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Organization
import com.gmin.serverstandard.application.port.`in`.command.CreateOrganizationCommand

/**
 * 조직 생성을 위한 유스케이스 인터페이스
 */
interface CreateOrganizationUseCase {
    /**
     * 새로운 조직을 생성합니다.
     *
     * @param command 조직 생성에 필요한 데이터를 담은 커맨드 객체
     * @return 생성된 조직 (성공/실패 여부를 포함한 Result 객체)
     */
    fun createOrganization(command: CreateOrganizationCommand): Result<Organization>
    
    /**
     * 조직에 사용자를 추가합니다.
     *
     * @param organizationId 사용자를 추가할 조직 ID
     * @param userId 추가할 사용자 ID
     * @return 성공/실패 여부 (Result 객체)
     */
    fun addUserToOrganization(organizationId: Int, userId: Int): Result<Boolean>
}