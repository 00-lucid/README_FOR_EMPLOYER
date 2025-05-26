package com.gmin.serverstandard.adapter.`in`.web.controller

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.NoticeDto
import com.gmin.serverstandard.application.port.`in`.GetNoticeUseCase
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.http.ResponseEntity
import org.springframework.http.HttpStatus
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag

@RestController
@RequestMapping("/api/v1/notice")
@Tag(name = "공지사항 API", description = "공지사항 관련 API")
class NoticeController(
    private val noticeUseCase: GetNoticeUseCase
) {
    @Operation(
        summary = "회사별 공지사항 조회 API",
        description = "특정 회사의 공지사항을 조회하는 API입니다."
    )
    @GetMapping("/company/{companyId}")
    fun getNoticesByCompanyId(
        @PathVariable companyId: Int
    ): ResponseEntity<ApiResponseDto<List<NoticeDto>>> {
        val result = noticeUseCase.getNoticesByCompanyId(companyId)

        return if (result.isSuccess) {
            // 공지사항 조회 성공 시 데이터 반환
            val noticeList = result.getOrNull()?.map { NoticeDto.fromDomain(it) } ?: emptyList()
            ResponseEntity.ok(
                ApiResponseDto(
                    success = true,
                    message = "공지사항 조회 성공",
                    data = noticeList
                )
            )
        } else {
            // 조회 실패 시 에러 메시지 반환
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponseDto(
                    success = false,
                    message = "공지사항 조회 실패: ${result.exceptionOrNull()?.message ?: "데이터를 찾을 수 없습니다"}",
                    data = null
                )
            )
        }
    }
}