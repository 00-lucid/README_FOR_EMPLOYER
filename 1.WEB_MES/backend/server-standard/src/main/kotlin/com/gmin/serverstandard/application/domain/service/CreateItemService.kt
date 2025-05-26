package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Item
import com.gmin.serverstandard.application.port.`in`.CreateItemUseCase
import com.gmin.serverstandard.application.port.`in`.command.CreateItemCommand
import com.gmin.serverstandard.application.port.out.SaveItemPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@UseCase
@Service
@Transactional
class CreateItemService(
    private val saveItemPort: SaveItemPort
) : CreateItemUseCase {
    /**
     * 새로운 품목을 생성합니다.
     *
     * @param command 품목 생성에 필요한 데이터를 담은 커맨드 객체
     * @return 생성된 품목 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun createItem(command: CreateItemCommand): Result<Item> {
        // 품목 타입 유효성 검사
        if (!Item.isValidItemType(command.itemType)) {
            return Result.failure(IllegalArgumentException("유효하지 않은 품목 타입입니다: ${command.itemType}"))
        }
        
        // 현재 시간 생성
        val now = LocalDateTime.now()
        
        // 도메인 엔티티 생성
        val item = Item(
            itemId = 0, // 새 항목이므로 임시 ID 사용 (저장 시 자동 생성됨)
            itemName = command.itemName,
            itemType = command.itemType,
            unit = command.unit,
            salePrice = command.salePrice,
            createdAt = now,
            updatedAt = now,
            itemPhotoUri = command.itemPhotoUri,
            companyId = command.companyId
        )
        
        return try {
            // 품목 저장
            val savedItem = saveItemPort.save(item)
            Result.success(savedItem)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}