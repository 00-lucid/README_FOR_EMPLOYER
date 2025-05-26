package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Correspondent
import com.gmin.serverstandard.application.port.`in`.GetCorrespondentUseCase
import com.gmin.serverstandard.application.port.out.LoadCorrespondentPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@UseCase
@Service
@Transactional(readOnly = true)
class GetCorrespondentService(
    private val loadCorrespondentPort: LoadCorrespondentPort
) : GetCorrespondentUseCase {
    /**
     * 모든 거래처를 조회합니다.
     *
     * @return 모든 거래처 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getAllCorrespondents(): Result<List<Correspondent>> {
        val correspondentsOptional = loadCorrespondentPort.findAll()
        
        return if (correspondentsOptional.isPresent) {
            Result.success(correspondentsOptional.get())
        } else {
            Result.success(emptyList())
        }
    }

    /**
     * 특정 ID의 거래처를 조회합니다.
     *
     * @param correspondentId 조회할 거래처 ID
     * @return 해당 ID의 거래처 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getCorrespondentById(correspondentId: Int): Result<Correspondent> {
        val correspondentOptional = loadCorrespondentPort.findById(correspondentId)
        
        return if (correspondentOptional.isPresent) {
            Result.success(correspondentOptional.get())
        } else {
            Result.failure(NoSuchElementException("ID가 ${correspondentId}인 거래처를 찾을 수 없습니다."))
        }
    }

    /**
     * 특정 타입의 거래처를 조회합니다.
     *
     * @param type 조회할 거래처 타입
     * @return 해당 타입의 거래처 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getCorrespondentsByType(type: String): Result<List<Correspondent>> {
        // 거래처 타입 유효성 검사
        if (!Correspondent.isValidCorrespondentType(type)) {
            return Result.failure(IllegalArgumentException("유효하지 않은 거래처 타입입니다: $type"))
        }
        
        val correspondentsOptional = loadCorrespondentPort.findByType(type)
        
        return if (correspondentsOptional.isPresent) {
            Result.success(correspondentsOptional.get())
        } else {
            Result.success(emptyList())
        }
    }
}