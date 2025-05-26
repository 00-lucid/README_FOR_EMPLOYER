package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Item
import com.gmin.serverstandard.application.port.`in`.UpdateItemUseCase
import com.gmin.serverstandard.application.port.`in`.command.UpdateItemCommand
import com.gmin.serverstandard.application.port.out.LoadItemPort
import com.gmin.serverstandard.application.port.out.SaveItemPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@UseCase
@Service
@Transactional
class UpdateItemService(
    private val loadItemPort: LoadItemPort,
    private val saveItemPort: SaveItemPort
) : UpdateItemUseCase {
    /**
     * 기존 품목을 수정합니다.
     *
     * @param command 품목 수정에 필요한 데이터를 담은 커맨드 객체
     * @return 수정된 품목 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun updateItem(command: UpdateItemCommand): Result<Item> {
        // 품목 타입 유효성 검사
        if (!Item.isValidItemType(command.itemType)) {
            return Result.failure(IllegalArgumentException("유효하지 않은 품목 타입입니다: ${command.itemType}"))
        }
        
        // 품목 존재 여부 확인
        val existingItemOptional = loadItemPort.findById(command.itemId)
        if (existingItemOptional.isEmpty) {
            return Result.failure(NoSuchElementException("ID가 ${command.itemId}인 품목을 찾을 수 없습니다."))
        }
        
        // 현재 시간 생성 (수정 시간)
        val now = LocalDateTime.now()
        
        // 기존 품목 정보 가져오기
        val existingItem = existingItemOptional.get()
        
        // 도메인 엔티티 생성 (기존 생성 시간 유지, 수정 시간 업데이트)
        val updatedItem = Item(
            itemId = command.itemId,
            itemName = command.itemName,
            itemType = command.itemType,
            unit = command.unit,
            salePrice = command.salePrice,
            createdAt = existingItem.createdAt, // 기존 생성 시간 유지
            updatedAt = now, // 수정 시간 업데이트
            itemPhotoUri = command.itemPhotoUri,
            companyId = command.companyId
        )
        
        return try {
            // 품목 저장
            val savedItem = saveItemPort.save(updatedItem)
            Result.success(savedItem)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}