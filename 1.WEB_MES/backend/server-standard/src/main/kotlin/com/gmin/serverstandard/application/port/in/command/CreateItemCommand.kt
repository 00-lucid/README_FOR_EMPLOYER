package com.gmin.serverstandard.application.port.`in`.command

/**
 * 품목 생성을 위한 커맨드 클래스
 *
 * 품목 생성에 필요한 데이터를 담고 있습니다.
 */
data class CreateItemCommand(
    val itemName: String,
    val itemType: String,
    val unit: String,
    val salePrice: Double,
    val itemPhotoUri: String?,
    val companyId: Int
)