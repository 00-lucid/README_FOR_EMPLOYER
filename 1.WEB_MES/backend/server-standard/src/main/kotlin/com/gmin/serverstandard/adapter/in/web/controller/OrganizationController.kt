package com.gmin.serverstandard.adapter.`in`.web.controller

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.OrganizationDto
import com.gmin.serverstandard.adapter.`in`.web.dto.request.CreateOrganizationRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.UpdateOrganizationRequest
import com.gmin.serverstandard.application.port.`in`.CreateOrganizationUseCase
import com.gmin.serverstandard.application.port.`in`.DeleteOrganizationUseCase
import com.gmin.serverstandard.application.port.`in`.GetOrganizationUseCase
import com.gmin.serverstandard.application.port.`in`.UpdateOrganizationUseCase
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/organizations")
@Tag(name = "조직 API", description = "조직 관련 API")
class OrganizationController(
    private val createOrganizationUseCase: CreateOrganizationUseCase,
    private val getOrganizationUseCase: GetOrganizationUseCase,
    private val updateOrganizationUseCase: UpdateOrganizationUseCase,
    private val deleteOrganizationUseCase: DeleteOrganizationUseCase
) {
    @Operation(
        summary = "조직 목록 조회 API",
        description = "모든 조직 목록을 조회하는 API입니다."
    )
    @GetMapping
    fun getAllOrganizations(): ResponseEntity<ApiResponseDto<List<OrganizationDto>>> {
        val result = getOrganizationUseCase.getAllOrganizations()

        return if (result.isSuccess) {
            val organizations = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "조직 목록 조회 성공",
                    data = organizations?.let { OrganizationDto.fromDomainList(it) }
                )
            )
        } else {
            ResponseEntity.status(500).body(
                ApiResponseDto(
                    success = false,
                    message = "조직 목록 조회 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "조직 상세 조회 API",
        description = "특정 ID의 조직을 조회하는 API입니다."
    )
    @GetMapping("/{organizationId}")
    fun getOrganizationById(@PathVariable organizationId: Int): ResponseEntity<ApiResponseDto<OrganizationDto>> {
        val result = getOrganizationUseCase.getOrganizationById(organizationId)

        return if (result.isSuccess) {
            val organization = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "조직 조회 성공",
                    data = organization?.let { OrganizationDto.fromDomain(it) }
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is NoSuchElementException) 404 else 500
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "조직 조회 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "회사별 조직 목록 조회 API",
        description = "특정 회사의 조직 목록을 조회하는 API입니다."
    )
    @GetMapping("/company/{companyId}")
    fun getOrganizationsByCompanyId(@PathVariable companyId: Int): ResponseEntity<ApiResponseDto<List<OrganizationDto>>> {
        val result = getOrganizationUseCase.getOrganizationsByCompanyId(companyId)

        return if (result.isSuccess) {
            val organizations = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "회사별 조직 목록 조회 성공",
                    data = organizations?.let { OrganizationDto.fromDomainList(it) }
                )
            )
        } else {
            ResponseEntity.status(500).body(
                ApiResponseDto(
                    success = false,
                    message = "회사별 조직 목록 조회 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "사용자별 조직 목록 조회 API",
        description = "특정 사용자가 속한 조직 목록을 조회하는 API입니다."
    )
    @GetMapping("/user/{userId}")
    fun getOrganizationsByUserId(@PathVariable userId: Int): ResponseEntity<ApiResponseDto<List<OrganizationDto>>> {
        val result = getOrganizationUseCase.getOrganizationsByUserId(userId)

        return if (result.isSuccess) {
            val organizations = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "사용자별 조직 목록 조회 성공",
                    data = organizations?.let { OrganizationDto.fromDomainList(it) }
                )
            )
        } else {
            ResponseEntity.status(500).body(
                ApiResponseDto(
                    success = false,
                    message = "사용자별 조직 목록 조회 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "조직 생성 API",
        description = "새로운 조직을 생성하는 API입니다."
    )
    @PostMapping
    fun createOrganization(@RequestBody request: CreateOrganizationRequest): ResponseEntity<ApiResponseDto<OrganizationDto>> {
        val command = request.toCommand()
        val result = createOrganizationUseCase.createOrganization(command)

        return if (result.isSuccess) {
            val organization = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "조직 생성 성공",
                    data = organization?.let { OrganizationDto.fromDomain(it) }
                )
            )
        } else {
            ResponseEntity.status(400).body(
                ApiResponseDto(
                    success = false,
                    message = "조직 생성 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "조직 수정 API",
        description = "기존 조직을 수정하는 API입니다."
    )
    @PutMapping("/{organizationId}")
    fun updateOrganization(
        @PathVariable organizationId: Int,
        @RequestBody request: UpdateOrganizationRequest
    ): ResponseEntity<ApiResponseDto<OrganizationDto>> {
        val command = request.toCommand(organizationId)
        val result = updateOrganizationUseCase.updateOrganization(command)

        return if (result.isSuccess) {
            val organization = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "조직 수정 성공",
                    data = organization?.let { OrganizationDto.fromDomain(it) }
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is NoSuchElementException) 404 else 400
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "조직 수정 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "조직 삭제 API",
        description = "특정 ID의 조직을 삭제하는 API입니다."
    )
    @DeleteMapping("/{organizationId}")
    fun deleteOrganization(@PathVariable organizationId: Int): ResponseEntity<ApiResponseDto<Boolean>> {
        val result = deleteOrganizationUseCase.deleteOrganization(organizationId)

        return if (result.isSuccess) {
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "조직 삭제 성공",
                    data = true
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is NoSuchElementException) 404 else 500
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "조직 삭제 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "조직에 사용자 추가 API",
        description = "조직에 사용자를 추가하는 API입니다."
    )
    @PostMapping("/{organizationId}/users/{userId}")
    fun addUserToOrganization(
        @PathVariable organizationId: Int,
        @PathVariable userId: Int
    ): ResponseEntity<ApiResponseDto<Boolean>> {
        val result = createOrganizationUseCase.addUserToOrganization(organizationId, userId)

        return if (result.isSuccess) {
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "사용자 추가 성공",
                    data = true
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is NoSuchElementException) 404 else 500
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "사용자 추가 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "조직에서 사용자 제거 API",
        description = "조직에서 사용자를 제거하는 API입니다."
    )
    @DeleteMapping("/{organizationId}/users/{userId}")
    fun removeUserFromOrganization(
        @PathVariable organizationId: Int,
        @PathVariable userId: Int
    ): ResponseEntity<ApiResponseDto<Boolean>> {
        val result = updateOrganizationUseCase.removeUserFromOrganization(organizationId, userId)

        return if (result.isSuccess) {
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "사용자 제거 성공",
                    data = true
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is NoSuchElementException) 404 else 500
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "사용자 제거 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "루트 조직 목록 조회 API",
        description = "부모 조직이 없는 최상위 조직 목록을 조회하는 API입니다."
    )
    @GetMapping("/root")
    fun getRootOrganizations(): ResponseEntity<ApiResponseDto<List<OrganizationDto>>> {
        val result = getOrganizationUseCase.getRootOrganizations()

        return if (result.isSuccess) {
            val organizations = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "루트 조직 목록 조회 성공",
                    data = organizations?.let { OrganizationDto.fromDomainList(it) }
                )
            )
        } else {
            ResponseEntity.status(500).body(
                ApiResponseDto(
                    success = false,
                    message = "루트 조직 목록 조회 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }

    @Operation(
        summary = "자식 조직 목록 조회 API",
        description = "특정 부모 조직 ID를 가진 자식 조직 목록을 조회하는 API입니다."
    )
    @GetMapping("/parent/{parentOrganizationId}")
    fun getChildOrganizations(@PathVariable parentOrganizationId: Int): ResponseEntity<ApiResponseDto<List<OrganizationDto>>> {
        val result = getOrganizationUseCase.getChildOrganizations(parentOrganizationId)

        return if (result.isSuccess) {
            val organizations = result.getOrNull()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "자식 조직 목록 조회 성공",
                    data = organizations?.let { OrganizationDto.fromDomainList(it) }
                )
            )
        } else {
            ResponseEntity.status(500).body(
                ApiResponseDto(
                    success = false,
                    message = "자식 조직 목록 조회 실패: ${result.exceptionOrNull()?.message ?: "서버 오류"}",
                    data = null
                )
            )
        }
    }
}
