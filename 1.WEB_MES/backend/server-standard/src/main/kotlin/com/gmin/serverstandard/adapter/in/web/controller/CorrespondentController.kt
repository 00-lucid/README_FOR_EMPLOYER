package com.gmin.serverstandard.adapter.`in`.web.controller

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.CorrespondentDto
import com.gmin.serverstandard.adapter.`in`.web.dto.request.CreateCorrespondentRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.UpdateCorrespondentRequest
import com.gmin.serverstandard.application.port.`in`.CreateCorrespondentUseCase
import com.gmin.serverstandard.application.port.`in`.DeleteCorrespondentUseCase
import com.gmin.serverstandard.application.port.`in`.GetCorrespondentUseCase
import com.gmin.serverstandard.application.port.`in`.UpdateCorrespondentUseCase
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/v1/correspondents")
@Tag(name = "거래처 API", description = "거래처 관련 API")
class CorrespondentController(
    private val getCorrespondentUseCase: GetCorrespondentUseCase,
    private val createCorrespondentUseCase: CreateCorrespondentUseCase,
    private val updateCorrespondentUseCase: UpdateCorrespondentUseCase,
    private val deleteCorrespondentUseCase: DeleteCorrespondentUseCase
) {
    @Operation(
        summary = "모든 거래처 조회 API",
        description = "모든 거래처를 조회하는 API입니다."
    )
    @GetMapping
    fun getAllCorrespondents(): ResponseEntity<ApiResponseDto<List<CorrespondentDto>>> {
        val result = getCorrespondentUseCase.getAllCorrespondents()
        
        return if (result.isSuccess) {
            val correspondents = result.getOrNull()?.map { CorrespondentDto.fromDomain(it) } ?: emptyList()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "거래처 조회 성공",
                    data = correspondents
                )
            )
        } else {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponseDto(
                    success = false,
                    message = "거래처 조회 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "거래처 상세 조회 API",
        description = "특정 ID의 거래처를 조회하는 API입니다."
    )
    @GetMapping("/{correspondentId}")
    fun getCorrespondentById(@PathVariable correspondentId: Int): ResponseEntity<ApiResponseDto<CorrespondentDto>> {
        val result = getCorrespondentUseCase.getCorrespondentById(correspondentId)
        
        return if (result.isSuccess) {
            val correspondent = result.getOrNull()?.let { CorrespondentDto.fromDomain(it) }
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "거래처 조회 성공",
                    data = correspondent
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is NoSuchElementException) HttpStatus.NOT_FOUND else HttpStatus.INTERNAL_SERVER_ERROR
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "거래처 조회 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "거래처 타입별 조회 API",
        description = "특정 타입의 거래처를 조회하는 API입니다."
    )
    @GetMapping("/type")
    fun getCorrespondentsByType(@RequestParam type: String): ResponseEntity<ApiResponseDto<List<CorrespondentDto>>> {
        val result = getCorrespondentUseCase.getCorrespondentsByType(type)
        
        return if (result.isSuccess) {
            val correspondents = result.getOrNull()?.map { CorrespondentDto.fromDomain(it) } ?: emptyList()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "거래처 조회 성공",
                    data = correspondents
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is IllegalArgumentException) HttpStatus.BAD_REQUEST else HttpStatus.INTERNAL_SERVER_ERROR
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "거래처 조회 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "거래처 생성 API",
        description = "새로운 거래처를 생성하는 API입니다."
    )
    @PostMapping
    fun createCorrespondent(@Valid @RequestBody request: CreateCorrespondentRequest): ResponseEntity<ApiResponseDto<CorrespondentDto>> {
        val command = request.toCommand()
        val result = createCorrespondentUseCase.createCorrespondent(command)
        
        return if (result.isSuccess) {
            val createdCorrespondent = result.getOrNull()?.let { CorrespondentDto.fromDomain(it) }
            ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponseDto(
                    success = true,
                    message = "거래처 생성 성공",
                    data = createdCorrespondent
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is IllegalArgumentException) HttpStatus.BAD_REQUEST else HttpStatus.INTERNAL_SERVER_ERROR
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "거래처 생성 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "거래처 수정 API",
        description = "기존 거래처를 수정하는 API입니다."
    )
    @PutMapping("/{correspondentId}")
    fun updateCorrespondent(
        @PathVariable correspondentId: Int,
        @Valid @RequestBody request: UpdateCorrespondentRequest
    ): ResponseEntity<ApiResponseDto<CorrespondentDto>> {
        val command = request.toCommand(correspondentId)
        val result = updateCorrespondentUseCase.updateCorrespondent(command)
        
        return if (result.isSuccess) {
            val updatedCorrespondent = result.getOrNull()?.let { CorrespondentDto.fromDomain(it) }
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "거래처 수정 성공",
                    data = updatedCorrespondent
                )
            )
        } else {
            val status = when (result.exceptionOrNull()) {
                is NoSuchElementException -> HttpStatus.NOT_FOUND
                is IllegalArgumentException -> HttpStatus.BAD_REQUEST
                else -> HttpStatus.INTERNAL_SERVER_ERROR
            }
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "거래처 수정 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "거래처 삭제 API",
        description = "특정 ID의 거래처를 삭제하는 API입니다."
    )
    @DeleteMapping("/{correspondentId}")
    fun deleteCorrespondent(@PathVariable correspondentId: Int): ResponseEntity<ApiResponseDto<Boolean>> {
        val result = deleteCorrespondentUseCase.deleteCorrespondent(correspondentId)
        
        return if (result.isSuccess) {
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "거래처 삭제 성공",
                    data = result.getOrNull()
                )
            )
        } else {
            val status = when (result.exceptionOrNull()) {
                is NoSuchElementException -> HttpStatus.NOT_FOUND
                else -> HttpStatus.INTERNAL_SERVER_ERROR
            }
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "거래처 삭제 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
}