package com.gmin.serverstandard.adapter.`in`.web.dto

data class AuthTokenDto (
    val accessToken: String,
    val refreshToken: String,
    val accessTokenExpiresIn: Long,
    val refreshTokenExpiresIn: Long
)