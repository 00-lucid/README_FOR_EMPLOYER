package com.gmin.serverstandard.application.port.out

import com.gmin.serverstandard.application.domain.model.Organization
import java.util.Optional

/**
 * 조직 조회를 위한 포트 인터페이스
 */
interface LoadOrganizationPort {
    /**
     * 모든 조직을 조회합니다.
     *
     * @return 모든 조직 목록 (Optional로 감싸져 있음)
     */
    fun findAll(): Optional<List<Organization>>

    /**
     * 특정 ID의 조직을 조회합니다.
     *
     * @param organizationId 조회할 조직 ID
     * @return 해당 ID의 조직 (Optional로 감싸져 있음)
     */
    fun findById(organizationId: Int): Optional<Organization>

    /**
     * 특정 회사의 조직을 조회합니다.
     *
     * @param companyId 조회할 회사 ID
     * @return 해당 회사의 조직 목록 (Optional로 감싸져 있음)
     */
    fun findByCompanyId(companyId: Int): Optional<List<Organization>>

    /**
     * 특정 사용자가 속한 조직을 조회합니다.
     *
     * @param userId 조회할 사용자 ID
     * @return 해당 사용자가 속한 조직 목록 (Optional로 감싸져 있음)
     */
    fun findByUserId(userId: Int): Optional<List<Organization>>

    /**
     * 부모 조직 ID가 없는 루트 조직을 조회합니다.
     *
     * @return 루트 조직 목록 (Optional로 감싸져 있음)
     */
    fun findRootOrganizations(): Optional<List<Organization>>

    /**
     * 특정 부모 조직 ID를 가진 자식 조직을 조회합니다.
     *
     * @param parentOrganizationId 조회할 부모 조직 ID
     * @return 해당 부모 조직의 자식 조직 목록 (Optional로 감싸져 있음)
     */
    fun findByParentOrganizationId(parentOrganizationId: Int): Optional<List<Organization>>
}
