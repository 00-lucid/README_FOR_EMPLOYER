package com.quokka.server.domain.match

import org.springframework.data.mongodb.core.mapping.Document

@Document(collection = "matches")
data class Match(
        val driverCarpoolId: Int,
        val passengerCarpoolId: Int,
        var end: Boolean
)
