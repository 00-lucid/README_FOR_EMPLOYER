package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.UpdateCorrespondentCommand
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

/**
 * 거래처 수정 요청을 위한 DTO 클래스
 */
data class UpdateCorrespondentRequest(
    @field:NotBlank(message = "거래처명은 필수입니다.")
    @field:Size(max = 100, message = "거래처명은 100자를 초과할 수 없습니다.")
    val name: String,
    
    @field:NotBlank(message = "거래처 타입은 필수입니다.")
    @field:Pattern(regexp = "매입|매출|매출/매입", message = "거래처 타입은 '매입', '매출', '매출/매입' 중 하나여야 합니다.")
    val type: String,
    
    @field:NotBlank(message = "대표자명은 필수입니다.")
    @field:Size(max = 50, message = "대표자명은 50자를 초과할 수 없습니다.")
    val ceo: String,
    
    @field:NotBlank(message = "사업자번호는 필수입니다.")
    @field:Size(max = 20, message = "사업자번호는 20자를 초과할 수 없습니다.")
    val businessNumber: String,
    
    @field:NotBlank(message = "전화번호는 필수입니다.")
    @field:Size(max = 20, message = "전화번호는 20자를 초과할 수 없습니다.")
    val phoneNumber: String,
    
    @field:NotBlank(message = "이메일은 필수입니다.")
    @field:Email(message = "유효한 이메일 형식이어야 합니다.")
    @field:Size(max = 100, message = "이메일은 100자를 초과할 수 없습니다.")
    val email: String,
    
    @field:NotBlank(message = "주소는 필수입니다.")
    @field:Size(max = 255, message = "주소는 255자를 초과할 수 없습니다.")
    val address: String,
    
    @field:NotBlank(message = "상세주소는 필수입니다.")
    @field:Size(max = 255, message = "상세주소는 255자를 초과할 수 없습니다.")
    val detailAddress: String,
    
    @field:NotBlank(message = "비고는 필수입니다.")
    val note: String,
    
    @field:NotBlank(message = "거래처 사진 URI는 필수입니다.")
    @field:Size(max = 255, message = "거래처 사진 URI는 255자를 초과할 수 없습니다.")
    val correspondentPhotoUri: String
) {
    /**
     * UpdateCorrespondentRequest를 UpdateCorrespondentCommand로 변환합니다.
     *
     * @param correspondentId 수정할 거래처 ID
     * @return 생성된 UpdateCorrespondentCommand 객체
     */
    fun toCommand(correspondentId: Int): UpdateCorrespondentCommand {
        return UpdateCorrespondentCommand(
            correspondentId = correspondentId,
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