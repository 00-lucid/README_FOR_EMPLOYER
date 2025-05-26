package com.quokka.server.domain.etc

import org.springframework.stereotype.Service

@Service
class EtcService (private val recommendationCodeRepository: RecommendationCodeRepository) {
    fun verifyRecommendationCode(code: String): Boolean {
        return recommendationCodeRepository.findByCode(code) != null
    }

}