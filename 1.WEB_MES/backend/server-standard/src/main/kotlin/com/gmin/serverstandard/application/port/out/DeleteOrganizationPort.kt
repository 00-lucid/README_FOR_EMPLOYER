package com.gmin.serverstandard.application.port.out

/**
 * 조직 삭제를 위한 포트 인터페이스
 */
interface DeleteOrganizationPort {
    /**
     * 특정 ID의 조직을 삭제합니다.
     *
     * @param organizationId 삭제할 조직 ID
     * @return 삭제 성공 여부
     */
    fun deleteById(organizationId: Int): Boolean
}