package com.gmin.serverstandard.adapter.`in`.web.controller

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.ItemDto
import com.gmin.serverstandard.adapter.`in`.web.dto.request.CreateItemRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.UpdateItemRequest
import com.gmin.serverstandard.application.port.`in`.CreateItemUseCase
import com.gmin.serverstandard.application.port.`in`.DeleteItemUseCase
import com.gmin.serverstandard.application.port.`in`.GetItemUseCase
import com.gmin.serverstandard.application.port.`in`.UpdateItemUseCase
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
@RequestMapping("/api/v1/items")
@Tag(name = "품목 API", description = "품목 관련 API")
class ItemController(
    private val getItemUseCase: GetItemUseCase,
    private val createItemUseCase: CreateItemUseCase,
    private val updateItemUseCase: UpdateItemUseCase,
    private val deleteItemUseCase: DeleteItemUseCase
) {
    @Operation(
        summary = "모든 품목 조회 API",
        description = "모든 품목을 조회하는 API입니다."
    )
    @GetMapping
    fun getAllItems(): ResponseEntity<ApiResponseDto<List<ItemDto>>> {
        val result = getItemUseCase.getAllItems()
        
        return if (result.isSuccess) {
            val items = result.getOrNull()?.map { ItemDto.fromDomain(it) } ?: emptyList()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "품목 조회 성공",
                    data = items
                )
            )
        } else {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponseDto(
                    success = false,
                    message = "품목 조회 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "품목 상세 조회 API",
        description = "특정 ID의 품목을 조회하는 API입니다."
    )
    @GetMapping("/{itemId}")
    fun getItemById(@PathVariable itemId: Int): ResponseEntity<ApiResponseDto<ItemDto>> {
        val result = getItemUseCase.getItemById(itemId)
        
        return if (result.isSuccess) {
            val item = result.getOrNull()?.let { ItemDto.fromDomain(it) }
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "품목 조회 성공",
                    data = item
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is NoSuchElementException) HttpStatus.NOT_FOUND else HttpStatus.INTERNAL_SERVER_ERROR
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "품목 조회 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "회사별 품목 조회 API",
        description = "특정 회사의 품목을 조회하는 API입니다."
    )
    @GetMapping("/company/{companyId}")
    fun getItemsByCompanyId(@PathVariable companyId: Int): ResponseEntity<ApiResponseDto<List<ItemDto>>> {
        val result = getItemUseCase.getItemsByCompanyId(companyId)
        
        return if (result.isSuccess) {
            val items = result.getOrNull()?.map { ItemDto.fromDomain(it) } ?: emptyList()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "품목 조회 성공",
                    data = items
                )
            )
        } else {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                ApiResponseDto(
                    success = false,
                    message = "품목 조회 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "품목 타입별 조회 API",
        description = "특정 타입의 품목을 조회하는 API입니다."
    )
    @GetMapping("/type")
    fun getItemsByType(@RequestParam itemType: String): ResponseEntity<ApiResponseDto<List<ItemDto>>> {
        val result = getItemUseCase.getItemsByType(itemType)
        
        return if (result.isSuccess) {
            val items = result.getOrNull()?.map { ItemDto.fromDomain(it) } ?: emptyList()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "품목 조회 성공",
                    data = items
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is IllegalArgumentException) HttpStatus.BAD_REQUEST else HttpStatus.INTERNAL_SERVER_ERROR
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "품목 조회 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "품목 생성 API",
        description = "새로운 품목을 생성하는 API입니다."
    )
    @PostMapping
    fun createItem(@Valid @RequestBody request: CreateItemRequest): ResponseEntity<ApiResponseDto<ItemDto>> {
        val command = request.toCommand()
        val result = createItemUseCase.createItem(command)
        
        return if (result.isSuccess) {
            val createdItem = result.getOrNull()?.let { ItemDto.fromDomain(it) }
            ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponseDto(
                    success = true,
                    message = "품목 생성 성공",
                    data = createdItem
                )
            )
        } else {
            val status = if (result.exceptionOrNull() is IllegalArgumentException) HttpStatus.BAD_REQUEST else HttpStatus.INTERNAL_SERVER_ERROR
            ResponseEntity.status(status).body(
                ApiResponseDto(
                    success = false,
                    message = "품목 생성 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "품목 수정 API",
        description = "기존 품목을 수정하는 API입니다."
    )
    @PutMapping("/{itemId}")
    fun updateItem(
        @PathVariable itemId: Int,
        @Valid @RequestBody request: UpdateItemRequest
    ): ResponseEntity<ApiResponseDto<ItemDto>> {
        val command = request.toCommand(itemId)
        val result = updateItemUseCase.updateItem(command)
        
        return if (result.isSuccess) {
            val updatedItem = result.getOrNull()?.let { ItemDto.fromDomain(it) }
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "품목 수정 성공",
                    data = updatedItem
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
                    message = "품목 수정 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
    
    @Operation(
        summary = "품목 삭제 API",
        description = "특정 ID의 품목을 삭제하는 API입니다."
    )
    @DeleteMapping("/{itemId}")
    fun deleteItem(@PathVariable itemId: Int): ResponseEntity<ApiResponseDto<Boolean>> {
        val result = deleteItemUseCase.deleteItem(itemId)
        
        return if (result.isSuccess) {
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "품목 삭제 성공",
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
                    message = "품목 삭제 실패: ${result.exceptionOrNull()?.message ?: "알 수 없는 오류가 발생했습니다."}",
                    data = null
                )
            )
        }
    }
}