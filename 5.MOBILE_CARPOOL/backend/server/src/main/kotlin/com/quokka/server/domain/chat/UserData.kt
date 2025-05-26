package com.quokka.server.domain.chat

import org.springframework.data.mongodb.core.mapping.Field

data class UserData(
        @Field(name = "user_id")
        val userId: String,
        @Field(name = "user_name")
        val userName: String,
        @Field(name = "profile_image")
        val profileImage: String,
        val phone: String,
        val organization: String,
        val email: String
)
