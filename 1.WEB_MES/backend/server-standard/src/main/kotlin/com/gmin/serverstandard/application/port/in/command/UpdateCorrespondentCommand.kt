package com.gmin.serverstandard.application.port.`in`.command

/**
 * 거래처 수정을 위한 커맨드 클래스
 *
 * 거래처 수정에 필요한 데이터를 담고 있습니다.
 */
data class UpdateCorrespondentCommand(
    val correspondentId: Int,
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
)