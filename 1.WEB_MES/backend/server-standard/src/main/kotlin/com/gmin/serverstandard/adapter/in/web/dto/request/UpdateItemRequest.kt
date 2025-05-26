package com.gmin.serverstandard.adapter.`in`.web.dto.request

import com.gmin.serverstandard.application.port.`in`.command.UpdateItemCommand
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Size

/**
 * 품목 수정 요청을 위한 DTO 클래스
 */
data class UpdateItemRequest(
    @field:NotBlank(message = "품목명은 필수입니다.")
    @field:Size(max = 100, message = "품목명은 100자를 초과할 수 없습니다.")
    val itemName: String,
    
    @field:NotBlank(message = "품목 타입은 필수입니다.")
    @field:Pattern(regexp = "원자재|부자재|반제품|제품", message = "품목 타입은 '원자재', '부자재', '반제품', '제품' 중 하나여야 합니다.")
    val itemType: String,
    
    @field:NotBlank(message = "단위는 필수입니다.")
    @field:Size(max = 10, message = "단위는 10자를 초과할 수 없습니다.")
    val unit: String,
    
    @field:NotNull(message = "판매 가격은 필수입니다.")
    @field:DecimalMin(value = "0.0", inclusive = true, message = "판매 가격은 0 이상이어야 합니다.")
    val salePrice: Double,
    
    val itemPhotoUri: String?,
    
    @field:NotNull(message = "회사 ID는 필수입니다.")
    val companyId: Int
) {
    /**
     * UpdateItemRequest를 UpdateItemCommand로 변환합니다.
     *
     * @param itemId 수정할 품목 ID
     * @return 생성된 UpdateItemCommand 객체
     */
    fun toCommand(itemId: Int): UpdateItemCommand {
        return UpdateItemCommand(
            itemId = itemId,
            itemName = this.itemName,
            itemType = this.itemType,
            unit = this.unit,
            salePrice = this.salePrice,
            itemPhotoUri = this.itemPhotoUri,
            companyId = this.companyId
        )
    }
}