package com.quokka.server.web.push.dto

data class PushTestDto (
        var fcmTokens: List<String>,
        var data: PushData
        )

data class PushData (
        var title: String,
        var message: String,
)

data class PushChatData (
        var title: String,
        var message: String,
        var chatId: String,
)