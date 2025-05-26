package com.gmin.serverstandard.application.port.`in`.command

/**
 * 품목 수정을 위한 커맨드 클래스
 *
 * 품목 수정에 필요한 데이터를 담고 있습니다.
 */
data class UpdateItemCommand(
    val itemId: Int,
    val itemName: String,
    val itemType: String,
    val unit: String,
    val salePrice: Double,
    val itemPhotoUri: String?,
    val companyId: Int
)