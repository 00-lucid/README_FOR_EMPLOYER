package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.port.`in`.DeleteBomUseCase
import com.gmin.serverstandard.application.port.out.DeleteBomPort
import com.gmin.serverstandard.application.port.out.LoadBomPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@UseCase
@Service
@Transactional
class DeleteBomService(
    private val loadBomPort: LoadBomPort,
    private val deleteBomPort: DeleteBomPort
) : DeleteBomUseCase {
    /**
     * 특정 ID의 BOM을 삭제합니다.
     *
     * @param bomId 삭제할 BOM ID
     * @return 삭제 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun deleteBom(bomId: Int): Result<Boolean> {
        // 기존 BOM 존재 여부 확인
        val existingBomOptional = loadBomPort.findById(bomId)
        
        if (existingBomOptional.isEmpty) {
            return Result.failure(NoSuchElementException("ID가 ${bomId}인 BOM을 찾을 수 없습니다."))
        }
        
        // BOM에 연결된 품목이 있는지 확인
        val itemBomsOptional = loadBomPort.findItemBomsByBomId(bomId)
        if (itemBomsOptional.isPresent && itemBomsOptional.get().isNotEmpty()) {
            return Result.failure(IllegalStateException("BOM(ID: ${bomId})에 연결된 품목이 있어 삭제할 수 없습니다. 먼저 연결된 품목을 모두 제거해주세요."))
        }
        
        return try {
            // BOM 삭제
            val deleted = deleteBomPort.deleteById(bomId)
            Result.success(deleted)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}