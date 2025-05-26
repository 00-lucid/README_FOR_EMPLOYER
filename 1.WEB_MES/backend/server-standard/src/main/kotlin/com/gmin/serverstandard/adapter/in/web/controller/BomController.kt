package com.gmin.serverstandard.adapter.`in`.web.controller

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.BomDto
import com.gmin.serverstandard.adapter.`in`.web.dto.ItemBomDto
import com.gmin.serverstandard.adapter.`in`.web.dto.ItemBomTreeDto
import com.gmin.serverstandard.adapter.`in`.web.dto.ItemDto
import com.gmin.serverstandard.adapter.`in`.web.dto.request.AddItemToBomRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.CreateBomRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.UpdateBomRequest
import com.gmin.serverstandard.adapter.`in`.web.dto.request.UpdateItemInBomRequest
import com.gmin.serverstandard.application.port.`in`.CreateBomUseCase
import com.gmin.serverstandard.application.port.`in`.DeleteBomUseCase
import com.gmin.serverstandard.application.port.`in`.GetBomUseCase
import com.gmin.serverstandard.application.port.`in`.GetItemUseCase
import com.gmin.serverstandard.application.port.`in`.UpdateBomUseCase
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
@RequestMapping("/api/v1/boms")
@Tag(name = "BOM 관리", description = "BOM 관련 API")
class BomController(
    private val getBomUseCase: GetBomUseCase,
    private val createBomUseCase: CreateBomUseCase,
    private val updateBomUseCase: UpdateBomUseCase,
    private val deleteBomUseCase: DeleteBomUseCase,
    private val getItemUseCase: GetItemUseCase
) {
    @GetMapping
    @Operation(summary = "모든 BOM 조회", description = "시스템에 등록된 모든 BOM을 조회합니다.")
    fun getAllBoms(): ResponseEntity<ApiResponseDto<List<BomDto>>> {
        val bomsResult = getBomUseCase.getAllBoms()

        return if (bomsResult.isSuccess) {
            val boms = bomsResult.getOrNull() ?: emptyList()
            val bomDtos = boms.map { BomDto.fromDomain(it) }
            ResponseEntity.ok(ApiResponseDto.success(bomDtos))
        } else {
            val errorMessage = bomsResult.exceptionOrNull()?.message ?: "BOM 조회 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error(errorMessage))
        }
    }

    @GetMapping("/{bomId}")
    @Operation(summary = "특정 BOM 조회", description = "특정 ID의 BOM을 조회합니다.")
    fun getBomById(@PathVariable bomId: Int): ResponseEntity<ApiResponseDto<BomDto>> {
        val bomResult = getBomUseCase.getBomById(bomId)

        return if (bomResult.isSuccess) {
            val bom = bomResult.getOrNull()
            if (bom != null) {
                ResponseEntity.ok(ApiResponseDto.success(BomDto.fromDomain(bom)))
            } else {
                ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponseDto.error("ID가 ${bomId}인 BOM을 찾을 수 없습니다."))
            }
        } else {
            val errorMessage = bomResult.exceptionOrNull()?.message ?: "BOM 조회 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error(errorMessage))
        }
    }

    @GetMapping("/status/{bomStatus}")
    @Operation(summary = "상태별 BOM 조회", description = "특정 상태의 BOM을 조회합니다.")
    fun getBomsByStatus(@PathVariable bomStatus: String): ResponseEntity<ApiResponseDto<List<BomDto>>> {
        val bomsResult = getBomUseCase.getBomsByStatus(bomStatus)

        return if (bomsResult.isSuccess) {
            val boms = bomsResult.getOrNull() ?: emptyList()
            val bomDtos = boms.map { BomDto.fromDomain(it) }
            ResponseEntity.ok(ApiResponseDto.success(bomDtos))
        } else {
            val errorMessage = bomsResult.exceptionOrNull()?.message ?: "BOM 조회 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error(errorMessage))
        }
    }

    @GetMapping("/{bomId}/items")
    @Operation(summary = "BOM 품목 목록 조회", description = "특정 BOM에 속한 품목 목록을 조회합니다.")
    fun getItemBomsByBomId(@PathVariable bomId: Int): ResponseEntity<ApiResponseDto<List<ItemBomDto>>> {
        val itemBomsResult = getBomUseCase.getItemBomsByBomId(bomId)

        return if (itemBomsResult.isSuccess) {
            val itemBoms = itemBomsResult.getOrNull() ?: emptyList()
            val itemBomDtos = itemBoms.map { itemBom ->
                // 품목 정보 조회
                val itemResult = getItemUseCase.getItemById(itemBom.itemId)
                val item = if (itemResult.isSuccess) itemResult.getOrNull() else null

                // 부모 품목 정보 조회 (있는 경우)
                val parentItem = if (itemBom.parentItemId != null) {
                    val parentItemResult = getItemUseCase.getItemById(itemBom.parentItemId)
                    if (parentItemResult.isSuccess) parentItemResult.getOrNull() else null
                } else null

                // 품목 정보를 포함한 DTO 생성
                val dto = ItemBomDto.fromDomain(itemBom)
                if (item != null) {
                    dto.copy(
                        item = ItemDto.fromDomain(item),
                        parentItem = parentItem?.let { ItemDto.fromDomain(it) }
                    )
                } else dto
            }
            ResponseEntity.ok(ApiResponseDto.success(itemBomDtos))
        } else {
            val errorMessage = itemBomsResult.exceptionOrNull()?.message ?: "BOM 품목 조회 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error(errorMessage))
        }
    }

    @GetMapping("/{bomId}/tree")
    @Operation(summary = "BOM 품목 트리 조회", description = "특정 BOM에 속한 품목 목록을 트리 구조로 조회합니다.")
    fun getItemBomTreeByBomId(@PathVariable bomId: Int): ResponseEntity<ApiResponseDto<List<ItemBomTreeDto>>> {
        val itemBomTreeResult = getBomUseCase.getItemBomTreeByBomId(bomId)

        return if (itemBomTreeResult.isSuccess) {
            val itemBomTree = itemBomTreeResult.getOrNull() ?: emptyList()
            val itemBomTreeDtos = itemBomTree.map { treeNode -> 
                // 트리 노드의 품목 정보를 포함한 DTO 생성
                convertTreeNodeToDto(treeNode)
            }
            ResponseEntity.ok(ApiResponseDto.success(itemBomTreeDtos))
        } else {
            val errorMessage = itemBomTreeResult.exceptionOrNull()?.message ?: "BOM 품목 트리 조회 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponseDto.error(errorMessage))
        }
    }

    /**
     * 품목 BOM 트리 노드를 DTO로 변환합니다.
     * 각 노드의 품목 정보를 조회하여 포함시킵니다.
     *
     * @param treeNode 변환할 트리 노드
     * @return 변환된 DTO
     */
    private fun convertTreeNodeToDto(treeNode: GetBomUseCase.ItemBomTreeNode): ItemBomTreeDto {
        val itemBom = treeNode.itemBom

        // 품목 정보 조회
        val itemResult = getItemUseCase.getItemById(itemBom.itemId)
        val item = if (itemResult.isSuccess) itemResult.getOrNull() else null

        // 부모 품목 정보 조회 (있는 경우)
        val parentItem = if (itemBom.parentItemId != null) {
            val parentItemResult = getItemUseCase.getItemById(itemBom.parentItemId)
            if (parentItemResult.isSuccess) parentItemResult.getOrNull() else null
        } else null

        // 품목 정보를 포함한 ItemBomDto 생성
        val itemBomDto = ItemBomDto.fromDomain(itemBom)
        val updatedItemBomDto = if (item != null) {
            itemBomDto.copy(
                item = ItemDto.fromDomain(item),
                parentItem = parentItem?.let { ItemDto.fromDomain(it) }
            )
        } else itemBomDto

        // 자식 노드들도 재귀적으로 변환
        val childrenDtos = treeNode.children.map { convertTreeNodeToDto(it) }

        return ItemBomTreeDto(updatedItemBomDto, childrenDtos)
    }

    @PostMapping
    @Operation(summary = "BOM 생성", description = "새로운 BOM을 생성하고 선택적으로 품목들을 추가합니다.")
    fun createBom(@Valid @RequestBody request: CreateBomRequest): ResponseEntity<ApiResponseDto<BomDto>> {
        val command = request.toCommand()
        val bomResult = createBomUseCase.createBom(command)

        return if (bomResult.isSuccess) {
            val bom = bomResult.getOrNull()
            if (bom != null) {
                // BOM 생성 성공 후 품목 추가 처리
                val items = request.items
                if (!items.isNullOrEmpty()) {
                    // 품목들을 BOM에 추가
                    var allItemsAdded = true
                    var errorMessage = ""

                    // 먼저 부모 품목이 없는 루트 아이템들을 추가
                    val rootItems = items.filter { it.parentItemId == null }
                    for (item in rootItems) {
                        val addResult = createBomUseCase.addItemToBom(
                            bomId = bom.bomId,
                            itemId = item.itemId,
                            quantity = item.quantity,
                            remark = item.remark,
                            parentItemId = null
                        )

                        if (addResult.isFailure) {
                            allItemsAdded = false
                            errorMessage = addResult.exceptionOrNull()?.message ?: "품목 추가 중 오류가 발생했습니다."
                            break
                        }
                    }

                    // 루트 아이템 추가 성공 시 자식 아이템들 추가
                    if (allItemsAdded) {
                        val childItems = items.filter { it.parentItemId != null }
                        for (item in childItems) {
                            val addResult = createBomUseCase.addItemToBom(
                                bomId = bom.bomId,
                                itemId = item.itemId,
                                quantity = item.quantity,
                                remark = item.remark,
                                parentItemId = item.parentItemId
                            )

                            if (addResult.isFailure) {
                                allItemsAdded = false
                                errorMessage = addResult.exceptionOrNull()?.message ?: "품목 추가 중 오류가 발생했습니다."
                                break
                            }
                        }
                    }

                    if (!allItemsAdded) {
                        // 품목 추가 실패 시에도 BOM은 생성되었으므로 경고 메시지와 함께 성공 응답
                        return ResponseEntity.status(HttpStatus.CREATED)
                            .body(ApiResponseDto.success(
                                BomDto.fromDomain(bom), 
                                "BOM은 생성되었으나 일부 품목 추가에 실패했습니다: $errorMessage"
                            ))
                    }
                }

                ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponseDto.success(BomDto.fromDomain(bom)))
            } else {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("BOM 생성 중 오류가 발생했습니다."))
            }
        } else {
            val errorMessage = bomResult.exceptionOrNull()?.message ?: "BOM 생성 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error(errorMessage))
        }
    }

    @PutMapping("/{bomId}")
    @Operation(summary = "BOM 수정", description = "특정 ID의 BOM을 수정합니다.")
    fun updateBom(
        @PathVariable bomId: Int,
        @Valid @RequestBody request: UpdateBomRequest
    ): ResponseEntity<ApiResponseDto<BomDto>> {
        val command = request.toCommand(bomId)
        val bomResult = updateBomUseCase.updateBom(command)

        return if (bomResult.isSuccess) {
            val bom = bomResult.getOrNull()
            if (bom != null) {
                ResponseEntity.ok(ApiResponseDto.success(BomDto.fromDomain(bom)))
            } else {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("BOM 수정 중 오류가 발생했습니다."))
            }
        } else {
            val errorMessage = bomResult.exceptionOrNull()?.message ?: "BOM 수정 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error(errorMessage))
        }
    }

    @DeleteMapping("/{bomId}")
    @Operation(summary = "BOM 삭제", description = "특정 ID의 BOM을 삭제합니다.")
    fun deleteBom(@PathVariable bomId: Int): ResponseEntity<ApiResponseDto<Boolean>> {
        val deleteResult = deleteBomUseCase.deleteBom(bomId)

        return if (deleteResult.isSuccess) {
            val deleted = deleteResult.getOrNull() ?: false
            if (deleted) {
                ResponseEntity.ok(ApiResponseDto.success(true))
            } else {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("BOM 삭제 중 오류가 발생했습니다."))
            }
        } else {
            val errorMessage = deleteResult.exceptionOrNull()?.message ?: "BOM 삭제 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error(errorMessage))
        }
    }

    @PostMapping("/{bomId}/items")
    @Operation(summary = "BOM에 품목 추가", description = "특정 BOM에 품목을 추가합니다.")
    fun addItemToBom(
        @PathVariable bomId: Int,
        @Valid @RequestBody request: AddItemToBomRequest
    ): ResponseEntity<ApiResponseDto<Boolean>> {
        val addResult = createBomUseCase.addItemToBom(
            bomId = bomId,
            itemId = request.itemId,
            quantity = request.quantity,
            remark = request.remark,
            parentItemId = request.parentItemId
        )

        return if (addResult.isSuccess) {
            val added = addResult.getOrNull() ?: false
            if (added) {
                ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponseDto.success(true))
            } else {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("BOM에 품목 추가 중 오류가 발생했습니다."))
            }
        } else {
            val errorMessage = addResult.exceptionOrNull()?.message ?: "BOM에 품목 추가 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error(errorMessage))
        }
    }

    @PutMapping("/{bomId}/items/{itemId}")
    @Operation(summary = "BOM 내 품목 수정", description = "특정 BOM 내의 품목 정보를 수정합니다.")
    fun updateItemInBom(
        @PathVariable bomId: Int,
        @PathVariable itemId: Int,
        @Valid @RequestBody request: UpdateItemInBomRequest
    ): ResponseEntity<ApiResponseDto<Boolean>> {
        val updateResult = updateBomUseCase.updateItemInBom(
            bomId = bomId,
            itemId = itemId,
            quantity = request.quantity,
            remark = request.remark,
            parentItemId = request.parentItemId
        )

        return if (updateResult.isSuccess) {
            val updated = updateResult.getOrNull() ?: false
            if (updated) {
                ResponseEntity.ok(ApiResponseDto.success(true))
            } else {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("BOM 내 품목 수정 중 오류가 발생했습니다."))
            }
        } else {
            val errorMessage = updateResult.exceptionOrNull()?.message ?: "BOM 내 품목 수정 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error(errorMessage))
        }
    }

    @DeleteMapping("/{bomId}/items/{itemId}")
    @Operation(summary = "BOM에서 품목 제거", description = "특정 BOM에서 품목을 제거합니다.")
    fun removeItemFromBom(
        @PathVariable bomId: Int,
        @PathVariable itemId: Int
    ): ResponseEntity<ApiResponseDto<Boolean>> {
        val removeResult = updateBomUseCase.removeItemFromBom(bomId, itemId)

        return if (removeResult.isSuccess) {
            val removed = removeResult.getOrNull() ?: false
            if (removed) {
                ResponseEntity.ok(ApiResponseDto.success(true))
            } else {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponseDto.error("BOM에서 품목 제거 중 오류가 발생했습니다."))
            }
        } else {
            val errorMessage = removeResult.exceptionOrNull()?.message ?: "BOM에서 품목 제거 중 오류가 발생했습니다."
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponseDto.error(errorMessage))
        }
    }
}
