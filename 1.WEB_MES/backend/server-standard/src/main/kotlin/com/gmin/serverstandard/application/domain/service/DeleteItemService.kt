package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.port.`in`.DeleteItemUseCase
import com.gmin.serverstandard.application.port.out.DeleteItemPort
import com.gmin.serverstandard.application.port.out.LoadItemPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@UseCase
@Service
@Transactional
class DeleteItemService(
    private val loadItemPort: LoadItemPort,
    private val deleteItemPort: DeleteItemPort
) : DeleteItemUseCase {
    /**
     * 특정 ID의 품목을 삭제합니다.
     *
     * @param itemId 삭제할 품목 ID
     * @return 삭제 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun deleteItem(itemId: Int): Result<Boolean> {
        // 품목 존재 여부 확인
        val existingItemOptional = loadItemPort.findById(itemId)
        if (existingItemOptional.isEmpty) {
            return Result.failure(NoSuchElementException("ID가 ${itemId}인 품목을 찾을 수 없습니다."))
        }
        
        return try {
            // 품목 삭제
            val result = deleteItemPort.deleteById(itemId)
            Result.success(result)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}