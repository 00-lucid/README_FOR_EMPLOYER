package com.gmin.serverstandard.application.port.`in`

import com.gmin.serverstandard.adapter.`in`.web.dto.AuthTokenDto
import com.gmin.serverstandard.adapter.`in`.web.dto.UserDto
import com.gmin.serverstandard.application.port.`in`.command.LoginCommand
import com.gmin.serverstandard.application.port.`in`.command.SignupCommand

interface GetUserUseCase {
    /**
     * Handles the login process based on the given login command.
     *
     * @param command The login command containing the necessary credentials or input required for the login process.
     * @return A Result object containing the authentication tokens if login was successful, or an exception if it failed.
     */
    fun login(command: LoginCommand): Result<AuthTokenDto>

    /**
     * Refreshes the access token using a valid refresh token.
     *
     * @param refreshToken The refresh token to use for generating a new access token.
     * @return A Result object containing a new AuthTokenDto with fresh tokens if successful, or an exception if it failed.
     */
    fun refreshToken(refreshToken: String): Result<AuthTokenDto>

    /**
     * Handles the signup process based on the given signup command.
     *
     * @param command The signup command containing the necessary information required for the registration process.
     * @return A Result object containing the AuthTokenDto if signup was successful, or an exception if it failed.
     */
    fun signup(command: SignupCommand): Result<AuthTokenDto>

    /**
     * Retrieves user information by user ID.
     *
     * @param userId The ID of the user to retrieve.
     * @return A Result object containing the UserDto if successful, or an exception if it failed.
     */
    fun getUserById(userId: Int): Result<UserDto>
}
