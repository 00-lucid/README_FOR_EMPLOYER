package com.quokka.server.domain.user

import com.fasterxml.jackson.annotation.JsonFormat
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field
import java.time.LocalDateTime
import javax.persistence.GeneratedValue
import javax.persistence.Id

@Document(collection = "users")
class User(
        @Id
        var id: String? = null,

        @Field("user_id")
        var userId: String,

        @Field("user_data")
        var userData: UserData? = null,

        @Field("car_data")
        var carData: CarData? = null,

        @Field("block_users")
        var blockUsers: List<String> = ArrayList(),

        @Field("social_login_data")
        var socialLoginData: SocialLoginData? = null,

        @Field("more_info")
        var moreInfo: MoreInfo? = null,

        @Field("terms_checked")
        var termsChecked: Boolean = true,

        // 재영님 createdAt, updateAt이 배열형태로 와서 파싱하도록 변경했는데, 문제 생기면 말씀해주세요.
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        @Field("created_at")
        var createdAt: LocalDateTime? = null,

        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        @Field("updated_at")
        var updatedAt: LocalDateTime? = null,

        var uuid: String? = null,

        var fcmToken: String? = null
)

data class UserData (
        @Field("login_id")
        var loginId: String ?= null,
        var password: String ?= null,
        var username: String,
        @Field("profile_image")
        var profileImage: String,
        var organization: String ?= null,
        var email: String ?= null,
        var phone: String ?= null
)

data class CarData (
        var number: String ?= null,
        var type: String ?= null,
        @Field("is_wheelchair")
        var isWheelchair: Boolean ?= null
)

data class SocialLoginData (
        var provider: SocialLoginProvider,
        var id: String,
        @Field("access_token")
        var accessToken: String,
        @Field("refresh_token")
        var refreshToken: String = "",
//        var uuid: String
        ) {
        enum class SocialLoginProvider {
                GOOGLE, KAKAO, APPLE
        }
}

data class MoreInfo (
        var needGuardian: Boolean ?= null,
        var guardianPhone: String ?= null,
        @Field("use_wheelchair")
        var needWheelchair: Boolean ?= null,
        var etcInfo: String ? = null
)