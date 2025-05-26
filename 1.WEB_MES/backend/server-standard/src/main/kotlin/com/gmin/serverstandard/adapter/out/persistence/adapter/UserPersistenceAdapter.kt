package com.gmin.serverstandard.adapter.out.persistence.adapter

import com.gmin.serverstandard.adapter.out.persistence.mapper.UserMapper
import com.gmin.serverstandard.adapter.out.persistence.repository.SpringDataUserRepository
import com.gmin.serverstandard.application.domain.model.User
import com.gmin.serverstandard.application.port.out.LoadUserPort
import com.gmin.serverstandard.application.port.out.SaveUserPort
import org.springframework.stereotype.Component
import java.util.Optional

@Component
class UserPersistenceAdapter(
    private val userRepository: SpringDataUserRepository,
    private val userMapper: UserMapper
): LoadUserPort, SaveUserPort {
    override fun findByUsername(username: String): Optional<User> {
        val userEntity = userRepository.findByUsername(username)

        return if (userEntity != null) {
            Optional.of(userMapper.mapToDomainEntity(userEntity))
        } else {
            Optional.empty()
        }
    }

    override fun findByEmail(email: String): Optional<User> {
        val userEntity = userRepository.findByEmail(email)

        return if (userEntity != null) {
            Optional.of(userMapper.mapToDomainEntity(userEntity))
        } else {
            Optional.empty()
        }
    }

    override fun findByUserId(userId: Int): Optional<User> {
        val userEntity = userRepository.findByUserId(userId)

        return if (userEntity != null) {
            Optional.of(userMapper.mapToDomainEntity(userEntity))
        } else {
            Optional.empty()
        }
    }

    override fun findAllByCompanyId(companyId: Int): List<User> {
        val userEntities = userRepository.findAllByCompanyId(companyId)
        return userEntities.map { userMapper.mapToDomainEntity(it) }
    }

    override fun saveUser(user: User): User {
        val userJpaEntity = userMapper.mapToJpaEntity(user)
        val savedEntity = userRepository.save(userJpaEntity)
        return userMapper.mapToDomainEntity(savedEntity)
    }
}
