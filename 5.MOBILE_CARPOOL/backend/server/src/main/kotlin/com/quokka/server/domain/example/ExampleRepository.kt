package com.quokka.server.domain.example

import org.springframework.data.mongodb.repository.MongoRepository

interface ExampleRepository : MongoRepository<Example, String> {}