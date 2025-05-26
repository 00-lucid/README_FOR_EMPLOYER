package com.quokka.server.web.user.dto

data class SocialJoinData(
    var username: String, // required
    var phone: String, // required
    var profileImage: String?, // optional
    var carNumber: String?, // optional
    var carType: String?, // optional
    var carWheelchair: Boolean, // optional
    var needGuardian: Boolean, // required
    var guardianPhone: String?, // optional
    var needWheelchair: Boolean, // optional
    var etcInfo: String?, // optional
    var termsChecked: Boolean, // required
)

