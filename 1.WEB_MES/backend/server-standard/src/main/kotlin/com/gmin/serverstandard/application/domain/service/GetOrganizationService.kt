package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Organization
import com.gmin.serverstandard.application.port.`in`.GetOrganizationUseCase
import com.gmin.serverstandard.application.port.out.LoadOrganizationPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@UseCase
@Service
@Transactional(readOnly = true)
class GetOrganizationService(
    private val loadOrganizationPort: LoadOrganizationPort
) : GetOrganizationUseCase {

    override fun getAllOrganizations(): Result<List<Organization>> {
        return try {
            val organizationsOptional = loadOrganizationPort.findAll()

            if (organizationsOptional.isEmpty) {
                Result.success(emptyList())
            } else {
                Result.success(organizationsOptional.get())
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getOrganizationById(organizationId: Int): Result<Organization> {
        return try {
            val organizationOptional = loadOrganizationPort.findById(organizationId)

            if (organizationOptional.isEmpty) {
                Result.failure(NoSuchElementException("조직을 찾을 수 없습니다: ID $organizationId"))
            } else {
                Result.success(organizationOptional.get())
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getOrganizationsByCompanyId(companyId: Int): Result<List<Organization>> {
        return try {
            val organizationsOptional = loadOrganizationPort.findByCompanyId(companyId)

            if (organizationsOptional.isEmpty) {
                Result.success(emptyList())
            } else {
                Result.success(organizationsOptional.get())
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getOrganizationsByUserId(userId: Int): Result<List<Organization>> {
        return try {
            val organizationsOptional = loadOrganizationPort.findByUserId(userId)

            if (organizationsOptional.isEmpty) {
                Result.success(emptyList())
            } else {
                Result.success(organizationsOptional.get())
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getRootOrganizations(): Result<List<Organization>> {
        return try {
            val organizationsOptional = loadOrganizationPort.findRootOrganizations()

            if (organizationsOptional.isEmpty) {
                Result.success(emptyList())
            } else {
                Result.success(organizationsOptional.get())
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override fun getChildOrganizations(parentOrganizationId: Int): Result<List<Organization>> {
        return try {
            val organizationsOptional = loadOrganizationPort.findByParentOrganizationId(parentOrganizationId)

            if (organizationsOptional.isEmpty) {
                Result.success(emptyList())
            } else {
                Result.success(organizationsOptional.get())
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
