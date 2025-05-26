package com.quokka.server.domain.chat

import com.quokka.server.domain.message.MessageRepository
import com.quokka.server.domain.user.User
import com.quokka.server.domain.user.UserRepository
import com.quokka.server.web.chat.dto.ChatDetailDto
import com.quokka.server.web.chat.dto.ChatDto
import org.bson.types.ObjectId
import org.springframework.data.domain.PageRequest
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.web.client.HttpClientErrorException.Forbidden
import org.springframework.web.server.ResponseStatusException
import kotlin.streams.toList

@Service
class ChatService (
        private val chatRepository: ChatRepository,
        private val userRepository: UserRepository,
        private val messageRepository: MessageRepository,
        ) {
        fun create(userIds: List<String>, carpoolId: Int) {
                val users = userIds.map { userRepository.findByUserId(it) }
                val chat = Chat.create(users as List<User>, carpoolId)

                chatRepository.save(chat)
        }

        fun getById(chatId: ObjectId, userId: String): ChatDetailDto? {
                val top10Messages = messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, PageRequest.of(0, 10))
                val result = chatRepository.findById(chatId).map { chat ->
                        ChatDetailDto(chat, top10Messages)
                }.orElse(null)
                if (result.users.stream().noneMatch { it -> it.userId == userId }) throw ResponseStatusException(HttpStatus.FORBIDDEN)

                val chat = chatRepository.findById(chatId).get()
                if (chat.lastMessageData?.userId != userId) {
                        chat.unReadCount = 0;
                        chatRepository.save(chat)
                }
                return result
        }

        fun getByUserId(userId: String): List<ChatDto>? {
                val chats = chatRepository.findByUserId(userId)
                return chats.stream().map { chat -> ChatDto(chat) }.toList();
        }

}