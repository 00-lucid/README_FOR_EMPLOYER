package com.gmin.serverstandard.eaglered

import com.gmin.serverstandard.adapter.`in`.web.dto.ApiResponseDto
import com.gmin.serverstandard.adapter.`in`.web.dto.IncomingInspectionDto
import retrofit2.http.GET
import retrofit2.http.Query
import java.time.LocalDate
import org.springframework.web.bind.annotation.RequestHeader

interface EagleRedApi {
    /**
     * 기간별 입고 검사 내역을 조회합니다.
     */
    @GET("/api/v1/purchase-order-in-item-check/date-range")
    suspend fun getInspectionsByDateRange(
        @Query("startDate") startDate: LocalDate,
        @Query("endDate") endDate: LocalDate
    ): ApiResponseDto<List<IncomingInspectionDto>>

    /**
     * 승인 상태별 입고 검사 내역을 조회합니다.
     */
    @GET("/api/v1/purchase-order-in-item-check/status")
    suspend fun getInspectionsByApprovalStatus(
        @Query("isApproved") isApproved: Boolean
    ): ApiResponseDto<List<IncomingInspectionDto>>
}