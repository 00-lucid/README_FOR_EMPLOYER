package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.application.domain.model.Organization

/**
 * 조직 조회를 위한 유스케이스 인터페이스
 */
interface GetOrganizationUseCase {
    /**
     * 모든 조직을 조회합니다.
     *
     * @return 모든 조직 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getAllOrganizations(): Result<List<Organization>>

    /**
     * 특정 ID의 조직을 조회합니다.
     *
     * @param organizationId 조회할 조직 ID
     * @return 해당 ID의 조직 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getOrganizationById(organizationId: Int): Result<Organization>

    /**
     * 특정 회사의 조직을 조회합니다.
     *
     * @param companyId 조회할 회사 ID
     * @return 해당 회사의 조직 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getOrganizationsByCompanyId(companyId: Int): Result<List<Organization>>

    /**
     * 특정 사용자가 속한 조직을 조회합니다.
     *
     * @param userId 조회할 사용자 ID
     * @return 해당 사용자가 속한 조직 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getOrganizationsByUserId(userId: Int): Result<List<Organization>>

    /**
     * 부모 조직 ID가 없는 루트 조직을 조회합니다.
     *
     * @return 루트 조직 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getRootOrganizations(): Result<List<Organization>>

    /**
     * 특정 부모 조직 ID를 가진 자식 조직을 조회합니다.
     *
     * @param parentOrganizationId 조회할 부모 조직 ID
     * @return 해당 부모 조직의 자식 조직 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    fun getChildOrganizations(parentOrganizationId: Int): Result<List<Organization>>
}
