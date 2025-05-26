package com.quokka.server.web.user.dto

import com.quokka.server.domain.user.SocialLoginData
import java.time.LocalDateTime

data class UserInfoDto(
        var userData: UserData,
        var carData: CarData,
        var socialLoginData: SocialLoginData,
        var passengerInfo: PassengerInfo,
        var termsChecked: Boolean?,
//        var createdAt: LocalDateTime?,
//        var updatedAt: LocalDateTime?
) {
        data class UserData (
                var userId: String?,
                var username: String?,
                var phone: String?,
                var profileImage: String?
        )

        data class CarData (
                var carNumber: String?,
                var carType: String?,
                var carWheelchair: Boolean?
        )

        data class SocialLoginData (
                var provider: com.quokka.server.domain.user.SocialLoginData.SocialLoginProvider?,
                var accessToken: String?
        )

        data class PassengerInfo (
                var needGuardian: Boolean?,
                var guardianPhone: String?,
                var needWheelchair: Boolean?,
                var etcInfo: String?
        )
}






