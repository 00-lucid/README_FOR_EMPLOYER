package com.quokka.server.domain.chat

import org.bson.types.ObjectId
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.data.mongodb.repository.Query

interface ChatRepository: MongoRepository<Chat, ObjectId> {
    @Query("{'users.userId': ?0}")
    fun findByUserId(userId: String): List<Chat>
}