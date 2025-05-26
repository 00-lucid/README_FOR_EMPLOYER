package com.quokka.server.domain.passenger

data class Location(
        val lat: Double,
        val lng: Double,
        val name: String,
        val address: String
)

data class LatLng(
        val lat: Double,
        val lng: Double
)
