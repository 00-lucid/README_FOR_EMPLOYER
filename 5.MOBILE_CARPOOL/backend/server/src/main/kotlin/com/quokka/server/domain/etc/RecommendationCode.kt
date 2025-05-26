package com.quokka.server.domain.etc

import org.springframework.data.mongodb.core.mapping.Document
import javax.persistence.Id

@Document(collection = "recommendation_codes")
class RecommendationCode(
        @Id
        var id: String? = null,

        var code: String,
) {
}