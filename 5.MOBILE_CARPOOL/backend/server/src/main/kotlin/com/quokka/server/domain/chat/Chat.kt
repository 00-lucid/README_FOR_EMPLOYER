package com.quokka.server.domain.chat

import com.quokka.server.domain.user.User
import org.bson.types.ObjectId
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field
import java.time.LocalDateTime
import javax.persistence.Id
import kotlin.streams.toList

@Document(collection = "chats")
class Chat (
        @Id
        var id: ObjectId? = null,

        var title: String,

        var users: List<ChatUserData> = ArrayList(),

        @Field("message_count")
        var messageCount: Int,

        @Field("last_message_data")
        var lastMessageData: LastMessageData?,

        @Field("unread_count")
        var unReadCount: Int,

        @Field("carpool_id")
        var carpoolId: Int,

        var status: ChatStatus
) {
        companion object {
                fun create(users: List<User>, carpoolId: Int): Chat {
                        val initialUsers = users.stream().map { user -> ChatUserData(user) }.toList()
                        return Chat(
                                title = "",
                                users = initialUsers,
                                carpoolId = carpoolId,
                                status = ChatStatus.ACTIVE,
                                lastMessageData = LastMessageData(
                                        "system", "카풀이 매칭되었습니다.", LocalDateTime.now()
                                ),
                                messageCount = 0,
                                unReadCount = 0)
                }
        }
}

enum class ChatStatus {
        ACTIVE, INACTIVE
}

data class ChatUserData(
        @Field("user_id")
        var userId: String,
        @Field("username")
        var userName: String?,
        @Field("profile_image")
        var profileImage: String?,
        var organization: String?
) {
        constructor(user: User) : this(
                userId = user.userId,
                userName = user.userData?.username,
                profileImage = user.userData?.profileImage,
                organization = user.userData?.organization
        )
}

data class LastMessageData (
        @Field("user_id")
        var userId: String,
        @Field("message_content")
        var messageContent: String,
        @Field("updated_at")
        var updatedAt: LocalDateTime
)
