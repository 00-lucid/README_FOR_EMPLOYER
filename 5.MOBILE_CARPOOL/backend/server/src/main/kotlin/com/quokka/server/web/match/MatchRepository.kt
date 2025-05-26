package com.quokka.server.web.match

import com.quokka.server.domain.match.Match
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface MatchRepository : MongoRepository<Match, String> {
    fun findByDriverCarpoolIdAndEnd(id: Int, end: Boolean): Match?
    fun findByPassengerCarpoolIdAndEnd(id: Int, end: Boolean): Match?
    // fun updateEndByDriverCarpoolId(id: Int, end: Boolean)
    // fun updateEndByPassengerCarpoolId(id: Int, end: Boolean)
}