package com.quokka.server.domain.message

import org.bson.types.ObjectId
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field
import java.time.LocalDateTime
import javax.persistence.Id

@Document(collection = "messages")
class Message (
        @Id
        var id: String? = null,

        var content: String,

        var type: MessageType,

        @Field("user_id")
        var userId: String,

        var username: String,

        @Field("user_profile_image")
        var userProfileImage: String,

        @Field("chat_id")
        var chatId: ObjectId,

        @Field("created_at")
        var createdAt: LocalDateTime

//        @Field("read_user_ids")
//        var readUserIds: List<String> = ArrayList()
)

enum class MessageType {
        TEXT, IMAGE
}
