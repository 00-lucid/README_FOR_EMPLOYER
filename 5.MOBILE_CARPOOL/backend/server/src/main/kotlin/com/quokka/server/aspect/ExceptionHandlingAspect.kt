package com.quokka.server.aspect

import org.springframework.dao.DataAccessException
import org.springframework.dao.DuplicateKeyException
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import javax.naming.AuthenticationException

@RestControllerAdvice
class ExceptionHandlingAspect {
    @ExceptionHandler
    fun handleException(exception: Exception): ResponseEntity<String> {
        return when (exception) {
            is DataAccessException -> ResponseEntity("Database access error", HttpStatus.INTERNAL_SERVER_ERROR)
            is AuthenticationException -> ResponseEntity("Unauthorized", HttpStatus.UNAUTHORIZED)
            is NotFoundException -> ResponseEntity("Not Found", HttpStatus.NOT_FOUND)
            is DuplicateKeyException -> ResponseEntity("Duplicate key error", HttpStatus.CONFLICT)
            is IllegalStateException -> ResponseEntity(exception.message, HttpStatus.CONFLICT)
            is IllegalArgumentException -> ResponseEntity(exception.message, HttpStatus.CONFLICT)
            else -> ResponseEntity("Unexpected error", HttpStatus.INTERNAL_SERVER_ERROR)
        }
    }
}