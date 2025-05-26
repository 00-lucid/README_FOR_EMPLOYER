package com.quokka.server.web.example

import com.quokka.server.domain.example.Example
import com.quokka.server.domain.example.ExampleRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import springfox.documentation.annotations.ApiIgnore

//@ApiIgnore
//@RestController
//class ExampleController (private val exampleRepository: ExampleRepository) {
//
//    @GetMapping("/")
//    fun hi(): String {
//        return "hi"
//    }
//
//    @GetMapping("/examples")
//    fun examples(): MutableList<Example> {
//        return exampleRepository.findAll();
//    }
//
//}
