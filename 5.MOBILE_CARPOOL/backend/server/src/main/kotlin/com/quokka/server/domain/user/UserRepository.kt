package com.quokka.server.domain.user

import org.springframework.data.mongodb.repository.MongoRepository
import javax.persistence.EntityManager

interface UserRepository: MongoRepository<User, String> {
    fun findByUserId(userId: String): User?
    fun findByUuid(uuId: String): User?
    fun save(user: User?)
}