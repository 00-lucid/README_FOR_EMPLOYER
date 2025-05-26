package com.gmin.serverstandard

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients

@SpringBootApplication
@EnableFeignClients
class ServerStandardApplication

fun main(args: Array<String>) {
    runApplication<ServerStandardApplication>(*args)
}
