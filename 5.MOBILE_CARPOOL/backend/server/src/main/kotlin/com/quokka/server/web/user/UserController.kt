package com.quokka.server.web.user

import com.quokka.server.domain.cloud.S3Service
import com.quokka.server.domain.user.UserService
import com.quokka.server.web.auth.AuthService
import com.quokka.server.web.user.dto.SocialJoinData
import com.quokka.server.web.user.dto.UserInfoDto
import io.swagger.annotations.*
import org.hibernate.annotations.Parameter
import org.springframework.data.repository.query.Param
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@Api(tags = ["유저 API"], description = "쿼카 프로젝트 유저 API")
@RestController
@RequestMapping("/users")
class UserController(
        private val userService: UserService,
        private val authService: AuthService,
        private val s3Service: S3Service
) {

    // todo: 유효성 검사
    @ApiOperation(value = "socialJoin", notes = "소셜 회원가입")
    @PostMapping("/{userId}")
    fun socialJoin(@PathVariable userId: String, @RequestBody socialJoinData: SocialJoinData): String {
        println("socialJoinData = ${socialJoinData.toString()}")
        return userService.socialJoin(userId, socialJoinData)
    }

    // todo: 토큰 검증 인터셉터에서 처리
    @ApiOperation(value = "getUser", notes = "유저정보")
    @GetMapping("/{userId}")
    fun getUser(@PathVariable userId: String,
                @RequestHeader("Authorization") @ApiParam("Bearer AccessToken") authorizationHeader: String): UserInfoDto {
        val accessToken = authorizationHeader.replace("Bearer", "").trim()
        authService.verifyToken(accessToken) // 토큰 검증
        return userService.getUser(userId, accessToken)
    }

    @ApiOperation(value = "updateUserName", notes = "유저이름")
    @PatchMapping("/{userId}")
    fun updateUserName(
            @PathVariable userId: String,
            @RequestBody username: String,
//            @RequestHeader("Authorization") @ApiParam("Bearer AccessToken") authorizationHeader: String
    ): String {
//        val accessToken = authorizationHeader.replace("Bearer", "").trim()
//        authService.verifyToken(userId, accessToken)
        return userService.updateUserName(userId, username)
    }

    @ApiOperation(value = "updateProfileImage", notes = "유저이미지")
    @PatchMapping(value = ["/{userId}/image"])
    fun updateProfileImage(
            @PathVariable userId: String,
            fileUrl: String,
    ): String {
        // val profileImage = s3Service.uploadFile(file)
        return userService.updateProfileImage(userId, fileUrl)
    }

    @ApiOperation(value = "deleteUser", notes = "유저탈퇴")
    @DeleteMapping("/{userId}")
    fun deleteUser(
            @PathVariable userId: String,
//            @RequestHeader("Authorization") @ApiParam("Bearer AccessToken") authorizationHeader: String
    ) {
//        val accessToken = authorizationHeader.replace("Bearer", "").trim()
//        authService.verifyToken(userId, accessToken)
        userService.deleteUser(userId)
    }
}