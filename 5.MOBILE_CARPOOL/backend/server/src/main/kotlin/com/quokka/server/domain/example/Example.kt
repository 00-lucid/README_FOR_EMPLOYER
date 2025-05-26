package com.quokka.server.domain.example

import org.springframework.data.mongodb.core.mapping.Document
import javax.persistence.Id

@Document(collection = "examples")
class Example (
        @Id
        var id: String,
        var title: String,
        var year: Number,
)