package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.CreateCorrespondentCommand
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

/**
 * 거래처 생성 요청을 위한 DTO 클래스
 */
data class CreateCorrespondentRequest(
    val name: String,
    
    val type: String,
    
    val ceo: String,
    
    val businessNumber: String,
    
    val phoneNumber: String,
    
    val email: String,
    
    val address: String,
    
    val detailAddress: String,
    
    val note: String,
    
    val correspondentPhotoUri: String
) {
    /**
     * CreateCorrespondentRequest를 CreateCorrespondentCommand로 변환합니다.
     *
     * @return 생성된 CreateCorrespondentCommand 객체
     */
    fun toCommand(): CreateCorrespondentCommand {
        return CreateCorrespondentCommand(
            name = this.name,
            type = this.type,
            ceo = this.ceo,
            businessNumber = this.businessNumber,
            phoneNumber = this.phoneNumber,
            email = this.email,
            address = this.address,
            detailAddress = this.detailAddress,
            note = this.note,
            correspondentPhotoUri = this.correspondentPhotoUri
        )
    }
}