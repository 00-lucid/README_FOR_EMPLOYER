package com.quokka.server.web.chat.dto

import com.quokka.server.domain.chat.Chat
import com.quokka.server.domain.chat.ChatUserData
import com.quokka.server.domain.chat.LastMessageData
import com.quokka.server.domain.message.Message
import com.quokka.server.web.message.dto.MessageDto
import kotlin.streams.toList

class ChatDetailDto(
        var id: String,
        var title: String,
        var users: List<UserDataDto>,
        var messageCount: Int,
        var lastMessageData: LastMessageDataDto,
        var unReadCount: Int,
        var messages: List<MessageDto>
) {
        constructor(chat: Chat, messages: List<Message>): this(
                chat.id.toString(),
                chat.title,
                chat.users.map { user ->
                        UserDataDto(user) },
                chat.messageCount,
                LastMessageDataDto(chat.lastMessageData),
                chat.unReadCount,
                messages.stream().map { it -> MessageDto(it.id!!, it.content, it.userId, it.username, it.type, it.createdAt.toString()) }.toList()
        )
}