package com.gmin.serverstandard.adapter.`in`.web.dto

import com.gmin.serverstandard.application.domain.model.Correspondent
import java.time.LocalDateTime

/**
 * 거래처 정보를 클라이언트에 전달하기 위한 DTO 클래스
 *
 * 거래처의 모든 필요한 정보를 클라이언트에 제공합니다.
 */
data class CorrespondentDto(
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
    val correspondentPhotoUri: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        /**
         * 도메인 엔티티인 Correspondent를 CorrespondentDto로 변환합니다.
         *
         * @param correspondent 변환할 도메인 엔티티
         * @return 생성된 CorrespondentDto 객체
         */
        fun fromDomain(correspondent: Correspondent): CorrespondentDto {
            return CorrespondentDto(
                correspondentId = correspondent.correspondentId,
                name = correspondent.name,
                type = correspondent.type,
                ceo = correspondent.ceo,
                businessNumber = correspondent.businessNumber,
                phoneNumber = correspondent.phoneNumber,
                email = correspondent.email,
                address = correspondent.address,
                detailAddress = correspondent.detailAddress,
                note = correspondent.note,
                correspondentPhotoUri = correspondent.correspondentPhotoUri,
                createdAt = correspondent.createdAt,
                updatedAt = correspondent.updatedAt
            )
        }
    }
}