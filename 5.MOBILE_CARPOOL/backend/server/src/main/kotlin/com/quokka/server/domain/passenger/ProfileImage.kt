package com.quokka.server.domain.passenger

import org.springframework.data.mongodb.core.mapping.Field

data class ProfileImage(
        @Field(name = "user_title")
        val userTitle: String,
        @Field(name = "save_title")
        val saveTitle: String,
        val location: String
)
