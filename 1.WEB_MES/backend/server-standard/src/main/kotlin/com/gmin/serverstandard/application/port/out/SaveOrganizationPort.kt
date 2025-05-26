package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.Organization

/**
 * 조직 저장을 위한 포트 인터페이스
 */
interface SaveOrganizationPort {
    /**
     * 조직을 저장합니다. (생성 또는 수정)
     *
     * @param organization 저장할 조직 도메인 엔티티
     * @return 저장된 조직 도메인 엔티티
     */
    fun save(organization: Organization): Organization
    
    /**
     * 조직에 사용자를 추가합니다.
     *
     * @param organizationId 사용자를 추가할 조직 ID
     * @param userId 추가할 사용자 ID
     * @return 성공 여부
     */
    fun addUserToOrganization(organizationId: Int, userId: Int): Boolean
    
    /**
     * 조직에서 사용자를 제거합니다.
     *
     * @param organizationId 사용자를 제거할 조직 ID
     * @param userId 제거할 사용자 ID
     * @return 성공 여부
     */
    fun removeUserFromOrganization(organizationId: Int, userId: Int): Boolean
}