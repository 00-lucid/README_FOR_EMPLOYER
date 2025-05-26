package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.adapter.`in`.web.dto.UserDto
import com.gmin.serverstandard.application.port.`in`.GetUsersByCompanyIdUseCase
import com.gmin.serverstandard.application.port.out.LoadUserPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@UseCase
@Service
@Transactional(readOnly = true)
class GetUsersByCompanyIdService(
    private val loadUserPort: LoadUserPort
) : GetUsersByCompanyIdUseCase {
    override fun getUsersByCompanyId(companyId: Int): Result<List<UserDto>> {
        return try {
            val users = loadUserPort.findAllByCompanyId(companyId)
            val userDtos = users.map { UserDto.fromDomain(it) }
            Result.success(userDtos)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}