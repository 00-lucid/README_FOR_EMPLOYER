package com.quokka.server.web.match

import com.quokka.server.domain.match.Match
import com.quokka.server.web.carpool.CarpoolListRepository
import com.quokka.server.web.carpool.Role
import org.springframework.stereotype.Service

@Service
class MatchServiceImpl(
        private val matchRepository: MatchRepository,
        private val carpoolListRepository: CarpoolListRepository
): MatchService  {
    override fun addMatch(match: Match): Match {
        return matchRepository.save(match)
    }

    override fun updateMatch() {
        TODO("Not yet implemented")
    }

    override fun findCompleteMatchByCarpoolId(carpoolId: Int): Match? {
        val carpoolList = carpoolListRepository.findByCarpoolId(carpoolId)

        if (carpoolList.role == Role.Driver) {
            return matchRepository.findByDriverCarpoolIdAndEnd(carpoolId, true)
        } else {
            return matchRepository.findByPassengerCarpoolIdAndEnd(carpoolId, true)
        }
    }

    override fun findInCompleteMatchByCarpoolId(carpoolId: Int): Match? {
        val carpoolList = carpoolListRepository.findByCarpoolId(carpoolId)

        if (carpoolList.role == Role.Driver) {
            return matchRepository.findByDriverCarpoolIdAndEnd(carpoolId, false)
        } else {
            return matchRepository.findByPassengerCarpoolIdAndEnd(carpoolId, false)
        }
    }
}