package com.gmin.serverstandard.adapter.`in`.web.dto

// 표준 API 응답 형식
data class ApiResponseDto<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null
) {
    companion object {
        // 성공 응답 생성
        fun <T> success(data: T, message: String = "성공적으로 처리되었습니다."): ApiResponseDto<T> {
            return ApiResponseDto(
                success = true,
                message = message,
                data = data
            )
        }

        // 에러 응답 생성
        fun <T> error(message: String): ApiResponseDto<T> {
            return ApiResponseDto(
                success = false,
                message = message
            )
        }
    }
}