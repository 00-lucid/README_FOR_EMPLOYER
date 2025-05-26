package com.quokka.server.web.carpool

import com.quokka.server.domain.passenger.Location
import com.quokka.server.domain.user.User
import org.springframework.data.mongodb.core.mapping.Field

data class CarpoolListDetail(
        val driver: User?,
        val passenger: User?,
        val driverCarpoolList: CarpoolList?,
        val passengerCarpoolList: CarpoolList?,
        val boardingAddress: Location,
        val stopoverAddress: Location?,
        val destinationAddress: Location,
        val time: String,
        val status: Status
)