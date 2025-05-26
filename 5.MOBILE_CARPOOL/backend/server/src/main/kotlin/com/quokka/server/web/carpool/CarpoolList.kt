package com.quokka.server.web.carpool

import com.quokka.server.domain.passenger.Location
import org.springframework.data.mongodb.core.mapping.Document
import org.springframework.data.mongodb.core.mapping.Field
import javax.persistence.Id

enum class Role {
        Driver,
        Passenger
}

enum class ETC {
        Together,
        Dog,
        Bathchair
}

enum class Status {
        INIT, // 매칭 중
        MATCHED, // 매칭 완료
        DRIVING, // 운행 중
        COMPLETED, // 운행 완료
        CANCELLED // 취소
}

@Document(collection = "carpools")
data class CarpoolList(
        @Id
        var carpoolId: Int?,
        @Field(name = "boarding_address")
        val boardingAddress: Location,
        @Field(name = "destination_address")
        val destinationAddress: Location,
        val time: String,
        val role: Role,
        @Field(name = "able_both_role")
        val ableBothRole: Boolean,
        val etc: List<ETC>,
        val owner: String?,
        var carpoolStatus: Status,
        val isMorning: Boolean
)