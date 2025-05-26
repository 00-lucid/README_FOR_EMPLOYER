package com.gmin.serverstandard.application.port.`in`

/**
 * 조직 삭제를 위한 유스케이스 인터페이스
 */
interface DeleteOrganizationUseCase {
    /**
     * 특정 ID의 조직을 삭제합니다.
     *
     * @param organizationId 삭제할 조직 ID
     * @return 삭제 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    fun deleteOrganization(organizationId: Int): Result<Boolean>
}