package com.quokka.server.web.socket

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.quokka.server.domain.chat.ChatRepository
import com.quokka.server.domain.message.Message
import org.bson.types.ObjectId
import org.springframework.stereotype.Service
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.ConcurrentHashMap

@Service
class ChatWebSocketHandler(
        private val chatRepository: ChatRepository
) : TextWebSocketHandler() {

    private val sessions = ConcurrentHashMap<String, WebSocketSession>() // TODO: db로 변경

    override fun afterConnectionEstablished(session: WebSocketSession) {
        println("연결됨")
        val uri = session.uri
        val sessionId = uri?.query?.split("=")?.get(1) ?: throw Exception()
        sessions[sessionId] = session
    }

    override fun afterConnectionClosed(session: WebSocketSession, closeStatus: CloseStatus) {
        val sessionId = getSessionIdBySession(session)
        sessions.remove(sessionId)
    }

    override fun handleMessage(session: WebSocketSession, message: WebSocketMessage<*>) {
        data class ChatSocketReceivePayload(
                val chatId: String,
                val userId: String,
                val type:String,
        )

//        val sessionId = getSessionIdBySession(session)
//        println("payload = ${message.payload}")
//        println("sessions = $sessions")
        val jacksonMapper = jacksonObjectMapper();
        val payload = jacksonMapper
                .readValue(message.payload.toString(), ChatSocketReceivePayload::class.java)

        val chat = chatRepository.findById(ObjectId(payload.chatId)).get()
        if (chat.lastMessageData?.userId != payload.userId) {
            chat.unReadCount = 0;
            chatRepository.save(chat)
        }
    }

    fun sendMessage(receiveUserId: String, sendUserId: String, message: Message) {
        data class MessagePayload(
                val messageId: String,
                val chatId: String,
                val userId: String,
                val username: String,
                val content: String,
                val type: String,
                val createdAt: String
        )

        val sendData = MessagePayload(
                messageId = message.id.toString(),
                chatId = message.chatId.toString(),
                userId = sendUserId,
                username = message.username,
                content = message.content,
                type = message.type.toString(),
                createdAt = message.createdAt.toString()
        )
        val objectMapper = ObjectMapper()
        objectMapper.registerModule(JavaTimeModule())
        val payload = objectMapper.writeValueAsString(sendData)
        sessions
                .filterKeys { it == receiveUserId || it == sendUserId }
                .values
                .forEach { it.sendMessage(TextMessage(payload)) }
    }

    private fun generateSessionId(): String {
        return java.util.UUID.randomUUID().toString()
    }

    private fun getSessionIdBySession(session: WebSocketSession): String? {
        return sessions.entries.find { it.value == session }?.key
    }

    override fun supportsPartialMessages(): Boolean {
        return false
    }
}