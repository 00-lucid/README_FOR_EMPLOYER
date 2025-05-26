package com.quokka.server.web.chat.dto

import com.quokka.server.domain.chat.Chat
import com.quokka.server.domain.chat.ChatUserData
import com.quokka.server.domain.chat.LastMessageData

class ChatDto(
        var id: String,
        var title: String,
        var users: List<UserDataDto>,
        var messageCount: Int,
        var lastMessageData: LastMessageDataDto,
        var unReadCount: Int,
) {
        constructor(chat: Chat): this(
                chat.id.toString(),
                chat.title,
                chat.users.map { user ->
                        UserDataDto(user) },
                chat.messageCount,
                LastMessageDataDto(chat.lastMessageData),
                chat.unReadCount
        )
}

data class UserDataDto(
        val userId: String,
        val userName: String?,
        val profileImage: String?,
        val organization: String?,
) {
        constructor(chatUserData: ChatUserData): this(
                chatUserData.userId,
                chatUserData.userName,
                chatUserData.profileImage,
                chatUserData.organization)
}


data class LastMessageDataDto (
        var userId: String,
        var content: String,
        var updatedAt: String
) {
        constructor(lastMessageData: LastMessageData?): this(
                lastMessageData!!.userId,
                lastMessageData.messageContent,
                lastMessageData.updatedAt.toString()
        )
}