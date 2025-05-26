package com.quokka.server.web.carpool

import com.quokka.server.domain.passenger.Location

data class CarpoolListRequest(
        val boardingAddress: Location,
        val destinationAddress: Location,
        val time: String,
        val role: Role,
        val ableBothRole: Boolean,
        val etc: List<ETC>,
)
