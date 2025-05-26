package com.gmin.servereaglered.service

import com.gmin.servereaglered.model.WorkOrderDetailEntity
import com.gmin.servereaglered.model.WorkOrderMasterEntity
import com.gmin.servereaglered.repository.WorkOrderDetailRepository
import com.gmin.servereaglered.repository.WorkOrderMasterRepository
import com.gmin.serverstandard.adapter.`in`.web.dto.WorkOrderDetailDto
import com.gmin.serverstandard.adapter.`in`.web.dto.WorkOrderDto
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.NoSuchElementException
import java.util.Date

@Service
class WorkOrderService(
    private val workOrderMasterRepository: WorkOrderMasterRepository,
    private val workOrderDetailRepository: WorkOrderDetailRepository
) {
    /**
     * 모든 작업지시를 조회합니다.
     * 마스터와 상세 정보를 결합하여 반환합니다.
     * 결과는 InputDate 기준으로 최신순으로 정렬됩니다.
     *
     * @return InputDate 내림차순으로 정렬된 작업지시 DTO 리스트
     */
    fun getAllWorkOrders(): List<WorkOrderDto> {
        val masters = workOrderMasterRepository.findAll()
            .filter { master -> master.delYn != "Y" }
            // InputDate 기준으로 내림차순 정렬 (최신 날짜가 먼저 오도록)
            // inputDate가 null인 경우 가장 오래된 것으로 간주 (Date(0))
            .sortedByDescending { it.inputDate ?: Date(0) }

        return masters.map { master ->
            val details = workOrderDetailRepository.findByIdWorkOrderNo(master.id.workOrderNo)
                .filter { detail -> detail.delYn != "Y" }
            // 상세 정보도 특정 순서로 정렬해야 한다면 여기에 추가 (예: workOrderSeq 오름차순)
            // .sortedBy { it.id.workOrderSeq }

            createWorkOrderDto(master, details)
        }
    }

    /**
     * 특정 작업지시번호에 해당하는 작업지시를 조회합니다.
     *
     * @param workOrderNo 작업지시번호
     * @return 작업지시 DTO 리스트
     * @throws NoSuchElementException 해당 작업지시번호의 작업지시가 없을 경우
     */
    fun getWorkOrderByNo(workOrderNo: String): List<WorkOrderDto> {
        val masters = workOrderMasterRepository.findByIdWorkOrderNo(workOrderNo)
            .filter { master -> master.delYn != "Y" } // DelYn이 Y인 마스터 제외

        if (masters.isEmpty()) {
            throw NoSuchElementException("작업지시번호가 ${workOrderNo}인 작업지시를 찾을 수 없습니다.")
        }

        return masters.map { master ->
            val details = workOrderDetailRepository.findByIdWorkOrderNo(master.id.workOrderNo)
                .filter { detail -> detail.delYn != "Y" } // DelYn이 Y인 상세 제외

            if (details.isEmpty()) {
                throw NoSuchElementException("작업지시번호가 ${workOrderNo}인 작업지시 상세를 찾을 수 없습니다.")
            }

            createWorkOrderDto(master, details)
        }
    }

    /**
     * 특정 기간 내의 작업지시를 조회합니다.
     *
     * @param startDate 시작일
     * @param endDate 종료일
     * @return 작업지시 DTO 리스트
     */
    fun getWorkOrdersByDateRange(startDate: LocalDate, endDate: LocalDate): List<WorkOrderDto> {
        // LocalDate를 String으로 변환 (yyyy-MM-dd 형식)
        val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
        val startDateStr = startDate.format(formatter)
        val endDateStr = endDate.format(formatter)

        // 기간 내의 작업지시 마스터 조회
        val masters = workOrderMasterRepository.findByWorkOrderDateBetween(startDateStr, endDateStr)
            .sortedByDescending { it.inputDate ?: Date(0) }

        return masters.map { master ->
            val details = workOrderDetailRepository.findByIdWorkOrderNo(master.id.workOrderNo)
                .filter { detail -> detail.delYn != "Y" }

            createWorkOrderDto(master, details)
        }
    }

    /**
     * 마스터와 상세 엔티티 리스트를 DTO로 결합합니다.
     *
     * @param master 작업지시 마스터 엔티티
     * @param details 작업지시 상세 엔티티 리스트
     * @return 결합된 작업지시 DTO
     */
    private fun createWorkOrderDto(master: WorkOrderMasterEntity, details: List<WorkOrderDetailEntity>): WorkOrderDto {
        val detailDtos = details.map { detail ->
            WorkOrderDetailDto(
                workOrderSeq = detail.id.workOrderSeq.toInt(),
                startTime = detail.startTime,
                endTime = detail.endTime,
                memberCd = detail.memberCd,
                processCd = detail.processCd ?: "",
                itemCd = detail.itemCd,
                workQty = detail.workQty,
                equiCd = detail.equiCd ?: "",
                comYn = detail.comYn.toString()
            )
        }

        return WorkOrderDto(
            // master
            prdReqNo = master.id.prdReqNo,
            prdPlanNo = master.id.prdPlanNo,
            workOrderNo = master.id.workOrderNo,
            compCd = master.compCd ?: "",
            workOrderDate = master.workOrderDate ?: "",
            lotSize = master.lotSize ?: 0,
            delYn = master.delYn ?: "",
            inputDate = master.inputDate ?: Date(),
            inputUser = master.inputUser ?: "",

            // detail
            details = detailDtos
        )
    }
}
