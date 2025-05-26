package com.quokka.server.domain.message

import com.quokka.server.domain.chat.Chat
import com.quokka.server.domain.chat.ChatRepository
import com.quokka.server.domain.chat.LastMessageData
import com.quokka.server.domain.push.PushService
import com.quokka.server.domain.user.UserRepository
import com.quokka.server.web.message.dto.CreateMessageDto
import com.quokka.server.web.message.dto.MessageListDto
import com.quokka.server.web.push.dto.PushChatData
import com.quokka.server.web.socket.ChatWebSocketHandler
import org.bson.types.ObjectId
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import kotlin.streams.toList

@Service
class MessageService (
        private val messageRepository: MessageRepository,
        private val userRepository: UserRepository,
        private val chatRepository: ChatRepository,
        private val chatWebSocketHandler: ChatWebSocketHandler,
        private val pushService: PushService
        ) {
        fun create(createMessageDto: CreateMessageDto): String {
                val user = userRepository.findByUserId(createMessageDto.userId) ?: throw NotFoundException()
                val message = Message(
                        content = createMessageDto.content,
                        type = MessageType.TEXT,
                        userId = createMessageDto.userId,
                        username = user.userData!!.username,
                        userProfileImage = user.userData!!.profileImage,
                        chatId = ObjectId(createMessageDto.chatId),
                        createdAt = LocalDateTime.now()
                )
                val chat = chatRepository.findById(ObjectId(createMessageDto.chatId)).get()
                val receiveUserId = chat.users.first() { it.userId != createMessageDto.userId }.userId
                val receiveUser = userRepository.findByUserId(receiveUserId)

                messageRepository.save(message)
                updateChat(chat, message)
                chatWebSocketHandler.sendMessage(receiveUserId, createMessageDto.userId, message)
                pushService.pushChat(listOf(receiveUser!!.fcmToken.toString()), PushChatData(message.username, message.content, createMessageDto.chatId))
                return "Ok"
        }

        private fun updateChat(chat: Chat, message: Message) {
                chat.messageCount++
                chat.unReadCount++
                chat.lastMessageData = LastMessageData(
                        userId = message.userId,
                        messageContent = message.content,
                        updatedAt = LocalDateTime.now()
                )
                chatRepository.save(chat)
        }

        fun findMessagesByChatIdBeforeId(chatId: ObjectId, lastId: ObjectId?, pageable: Pageable): List<MessageListDto> {
                 if (lastId != null) {
                         val messages = messageRepository.findByChatIdAndIdLessThanOrderByIdDesc(chatId, lastId, pageable);
                         return messages.stream().map { it -> MessageListDto(it) }.toList()
                 } else {
                         val messages = messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable)
                         return messages.stream().map { it -> MessageListDto(it) }.toList()
                }
        }
}