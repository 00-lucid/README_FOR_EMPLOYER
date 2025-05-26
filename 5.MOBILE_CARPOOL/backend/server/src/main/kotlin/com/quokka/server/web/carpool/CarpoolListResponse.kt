package com.quokka.server.web.carpool

data class CarpoolListResponse(
        var date: String?,
        var carpools: List<CarpoolList>
)
