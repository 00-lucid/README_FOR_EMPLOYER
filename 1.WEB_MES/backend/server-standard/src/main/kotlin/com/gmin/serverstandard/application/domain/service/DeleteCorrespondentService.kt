package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.port.`in`.DeleteCorrespondentUseCase
import com.gmin.serverstandard.application.port.out.DeleteCorrespondentPort
import com.gmin.serverstandard.application.port.out.LoadCorrespondentPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@UseCase
@Service
@Transactional
class DeleteCorrespondentService(
    private val loadCorrespondentPort: LoadCorrespondentPort,
    private val deleteCorrespondentPort: DeleteCorrespondentPort
) : DeleteCorrespondentUseCase {
    /**
     * 특정 ID의 거래처를 삭제합니다.
     *
     * @param correspondentId 삭제할 거래처 ID
     * @return 삭제 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun deleteCorrespondent(correspondentId: Int): Result<Boolean> {
        // 기존 거래처 존재 여부 확인
        val existingCorrespondentOptional = loadCorrespondentPort.findById(correspondentId)
        
        if (!existingCorrespondentOptional.isPresent) {
            return Result.failure(NoSuchElementException("ID가 ${correspondentId}인 거래처를 찾을 수 없습니다."))
        }
        
        return try {
            // 거래처 삭제
            val deleted = deleteCorrespondentPort.deleteById(correspondentId)
            Result.success(deleted)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}