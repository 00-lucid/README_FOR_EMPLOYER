package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Correspondent
import com.gmin.serverstandard.application.port.`in`.CreateCorrespondentUseCase
import com.gmin.serverstandard.application.port.`in`.command.CreateCorrespondentCommand
import com.gmin.serverstandard.application.port.out.SaveCorrespondentPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@UseCase
@Service
@Transactional
class CreateCorrespondentService(
    private val saveCorrespondentPort: SaveCorrespondentPort
) : CreateCorrespondentUseCase {
    /**
     * 새로운 거래처를 생성합니다.
     *
     * @param command 거래처 생성에 필요한 데이터를 담은 커맨드 객체
     * @return 생성된 거래처 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun createCorrespondent(command: CreateCorrespondentCommand): Result<Correspondent> {
        // 거래처 타입 유효성 검사
        if (!Correspondent.isValidCorrespondentType(command.type)) {
            return Result.failure(IllegalArgumentException("유효하지 않은 거래처 타입입니다: ${command.type}"))
        }
        
        // 현재 시간 생성
        val now = LocalDateTime.now()
        
        // 도메인 엔티티 생성
        val correspondent = Correspondent(
            correspondentId = 0, // 새 항목이므로 임시 ID 사용 (저장 시 자동 생성됨)
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
            createdAt = now,
            updatedAt = now
        )
        
        return try {
            // 거래처 저장
            val savedCorrespondent = saveCorrespondentPort.save(correspondent)
            Result.success(savedCorrespondent)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}