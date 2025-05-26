package com.quokka.server.domain.passenger

import org.springframework.data.mongodb.core.mapping.Field

data class UserData(
        val username: String,
        @Field(name = "profile_image")
        val profileImage: String,
        val phone: String,
        val organization: String,
        val email: String
)
