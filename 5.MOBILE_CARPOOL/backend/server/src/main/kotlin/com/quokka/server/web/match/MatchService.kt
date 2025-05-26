package com.quokka.server.web.match

import com.quokka.server.domain.match.Match

interface MatchService {
    fun addMatch(match: Match): Match
    fun updateMatch()
    fun findCompleteMatchByCarpoolId(carpoolId: Int): Match?
    fun findInCompleteMatchByCarpoolId(carpoolId: Int): Match?
}