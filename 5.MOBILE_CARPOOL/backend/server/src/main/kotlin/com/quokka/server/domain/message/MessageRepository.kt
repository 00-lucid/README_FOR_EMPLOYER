package com.quokka.server.domain.message

import org.bson.types.ObjectId
import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository

interface MessageRepository: MongoRepository<Message, String> {
    fun findByChatIdOrderByCreatedAtDesc(chatId: ObjectId, pageable: Pageable): List<Message>
    fun findByChatIdAndIdLessThanOrderByIdDesc(chatId: ObjectId, lastId: ObjectId, pageable: Pageable): List<Message>
}