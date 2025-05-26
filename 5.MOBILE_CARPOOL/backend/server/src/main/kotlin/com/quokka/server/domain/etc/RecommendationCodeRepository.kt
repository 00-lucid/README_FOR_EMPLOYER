package com.quokka.server.domain.etc

import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface RecommendationCodeRepository: MongoRepository<RecommendationCode, String> {
    fun findByCode(code: String): RecommendationCode?
}