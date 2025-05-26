package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Organization
import com.gmin.serverstandard.application.port.`in`.command.UpdateOrganizationCommand

/**
 * 조직 수정을 위한 유스케이스 인터페이스
 */
interface UpdateOrganizationUseCase {
    /**
     * 기존 조직을 수정합니다.
     *
     * @param command 조직 수정에 필요한 데이터를 담은 커맨드 객체
     * @return 수정된 조직 (성공/실패 여부를 포함한 Result 객체)
     */
    fun updateOrganization(command: UpdateOrganizationCommand): Result<Organization>
    
    /**
     * 조직에서 사용자를 제거합니다.
     *
     * @param organizationId 사용자를 제거할 조직 ID
     * @param userId 제거할 사용자 ID
     * @return 성공/실패 여부 (Result 객체)
     */
    fun removeUserFromOrganization(organizationId: Int, userId: Int): Result<Boolean>
}