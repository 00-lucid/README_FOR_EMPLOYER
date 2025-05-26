package com.quokka.server.web.message.dto

import com.quokka.server.domain.message.MessageType
import org.bson.types.ObjectId

data class CreateMessageDto (
        var content: String,
        var imageUrl: String,
        var userId: String,
        var chatId: String,
        var type: MessageType
)