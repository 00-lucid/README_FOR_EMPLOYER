package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Correspondent
import com.gmin.serverstandard.application.port.`in`.UpdateCorrespondentUseCase
import com.gmin.serverstandard.application.port.`in`.command.UpdateCorrespondentCommand
import com.gmin.serverstandard.application.port.out.LoadCorrespondentPort
import com.gmin.serverstandard.application.port.out.SaveCorrespondentPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@UseCase
@Service
@Transactional
class UpdateCorrespondentService(
    private val loadCorrespondentPort: LoadCorrespondentPort,
    private val saveCorrespondentPort: SaveCorrespondentPort
) : UpdateCorrespondentUseCase {
    /**
     * 기존 거래처를 수정합니다.
     *
     * @param command 거래처 수정에 필요한 데이터를 담은 커맨드 객체
     * @return 수정된 거래처 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun updateCorrespondent(command: UpdateCorrespondentCommand): Result<Correspondent> {
        // 거래처 타입 유효성 검사
        if (!Correspondent.isValidCorrespondentType(command.type)) {
            return Result.failure(IllegalArgumentException("유효하지 않은 거래처 타입입니다: ${command.type}"))
        }
        
        // 기존 거래처 조회
        val existingCorrespondentOptional = loadCorrespondentPort.findById(command.correspondentId)
        
        if (!existingCorrespondentOptional.isPresent) {
            return Result.failure(NoSuchElementException("ID가 ${command.correspondentId}인 거래처를 찾을 수 없습니다."))
        }
        
        val existingCorrespondent = existingCorrespondentOptional.get()
        
        // 현재 시간 생성
        val now = LocalDateTime.now()
        
        // 도메인 엔티티 생성 (기존 데이터 + 수정 데이터)
        val updatedCorrespondent = Correspondent(
            correspondentId = command.correspondentId,
            name = command.name,
            type = command.type,
            ceo = command.ceo,
            businessNumber = command.businessNumber,
            phoneNumber = command.phoneNumber,
            email = command.email,
            address = command.address,
            detailAddress = command.detailAddress,
            note = command.note,
            correspondentPhotoUri = command.correspondentPhotoUri,
            createdAt = existingCorrespondent.createdAt,
            updatedAt = now
        )
        
        return try {
            // 거래처 저장
            val savedCorrespondent = saveCorrespondentPort.save(updatedCorrespondent)
            Result.success(savedCorrespondent)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}