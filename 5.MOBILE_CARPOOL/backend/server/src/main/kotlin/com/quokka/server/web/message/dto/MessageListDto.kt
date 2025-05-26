package com.quokka.server.web.message.dto

import com.quokka.server.domain.message.Message
import com.quokka.server.domain.message.MessageType

data class MessageListDto(
        var id: String?,
        var content: String,
        var userId: String,
        var username: String,
        var type: MessageType,
        var userProfileImage: String,
        var chatId: String,
        var createdAt: String
) {
    constructor(message: Message): this(
            id = message.id,
            content = message.content,
            userId = message.userId,
            username = message.username,
            type = message.type,
            userProfileImage = message.userProfileImage,
            chatId = message.chatId.toString(),
            createdAt = message.createdAt.toString()
    )
}