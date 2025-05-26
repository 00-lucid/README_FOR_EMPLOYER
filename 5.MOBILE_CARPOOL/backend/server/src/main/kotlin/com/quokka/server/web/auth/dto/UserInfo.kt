package com.quokka.server.web.auth.dto

data class UserInfo(
        var userId: String,
        var name: String ?= null,
        var accessToken: String,
        var refreshToken: String,
)