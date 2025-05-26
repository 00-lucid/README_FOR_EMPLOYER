package com.quokka.server.web.message.dto

import com.quokka.server.domain.message.MessageType

data class MessageDto (
        var id: String,
        var content: String,
        var userId: String,
        var username: String,
        var type: MessageType,
        var createdAt: String,
)