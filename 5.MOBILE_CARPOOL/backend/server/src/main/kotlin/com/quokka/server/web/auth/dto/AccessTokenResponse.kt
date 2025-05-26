package com.quokka.server.web.auth.dto

data class AccessTokenResponse(
    var accessToken: String, // required
    var expiresIn: Int,
)

