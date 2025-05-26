package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Item
import com.gmin.serverstandard.application.port.`in`.GetItemUseCase
import com.gmin.serverstandard.application.port.out.LoadItemPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@UseCase
@Service
@Transactional(readOnly = true)
class GetItemService(
    private val loadItemPort: LoadItemPort
) : GetItemUseCase {
    /**
     * 모든 품목을 조회합니다.
     *
     * @return 모든 품목 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getAllItems(): Result<List<Item>> {
        val itemsOptional = loadItemPort.findAll()
        
        return if (itemsOptional.isEmpty) {
            Result.success(emptyList()) // 품목이 없는 경우 빈 리스트 반환
        } else {
            try {
                Result.success(itemsOptional.get())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    /**
     * 특정 ID의 품목을 조회합니다.
     *
     * @param itemId 조회할 품목 ID
     * @return 해당 ID의 품목 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getItemById(itemId: Int): Result<Item> {
        val itemOptional = loadItemPort.findById(itemId)
        
        return if (itemOptional.isEmpty) {
            Result.failure(NoSuchElementException("ID가 ${itemId}인 품목을 찾을 수 없습니다."))
        } else {
            try {
                Result.success(itemOptional.get())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    /**
     * 특정 회사의 품목을 조회합니다.
     *
     * @param companyId 조회할 회사 ID
     * @return 해당 회사의 품목 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getItemsByCompanyId(companyId: Int): Result<List<Item>> {
        val itemsOptional = loadItemPort.findByCompanyId(companyId)
        
        return if (itemsOptional.isEmpty) {
            Result.success(emptyList()) // 품목이 없는 경우 빈 리스트 반환
        } else {
            try {
                Result.success(itemsOptional.get())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    /**
     * 특정 품목 타입의 품목을 조회합니다.
     *
     * @param itemType 조회할 품목 타입
     * @return 해당 타입의 품목 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getItemsByType(itemType: String): Result<List<Item>> {
        // 품목 타입 유효성 검사
        if (!Item.isValidItemType(itemType)) {
            return Result.failure(IllegalArgumentException("유효하지 않은 품목 타입입니다: $itemType"))
        }
        
        val itemsOptional = loadItemPort.findByItemType(itemType)
        
        return if (itemsOptional.isEmpty) {
            Result.success(emptyList()) // 품목이 없는 경우 빈 리스트 반환
        } else {
            try {
                Result.success(itemsOptional.get())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
}