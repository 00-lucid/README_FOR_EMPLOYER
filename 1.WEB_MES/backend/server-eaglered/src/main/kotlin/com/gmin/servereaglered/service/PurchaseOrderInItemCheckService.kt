package com.gmin.servereaglered.service

import com.gmin.servereaglered.model.PurchaseOrderInItemCheckEntity
import com.gmin.servereaglered.model.PurchaseOrderInItemCheckId
import com.gmin.servereaglered.repository.PurchaseOrderInItemCheckRepository
import com.gmin.serverstandard.adapter.`in`.web.dto.request.IncomingInspectionRequest
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Date

@Service
class PurchaseOrderInItemCheckService(
    private val purchaseOrderInItemCheckRepository: PurchaseOrderInItemCheckRepository
) {
    fun getPurchaseOrderInItemCheckByDateBetween(startDate: LocalDateTime, endDate: LocalDateTime): List<PurchaseOrderInItemCheckEntity> {
        return purchaseOrderInItemCheckRepository.findByInputDateBetweenOrderByInputDateDesc(startDate, endDate)
    }

    fun getPurchaseOrderInItemCheckByIsApproved(isApproved: Boolean): List<PurchaseOrderInItemCheckEntity> {
        return purchaseOrderInItemCheckRepository.findByIsApproved(isApproved)
    }

    /**
     * 단일 입고 검사 정보를 업데이트합니다.
     *
     * @param updateDto 업데이트할 입고 검사 정보
     * @return 업데이트된 입고 검사 엔티티, 없으면 null
     */
    @Transactional
    fun updatePurchaseOrderInItemCheck(updateDto: IncomingInspectionRequest): PurchaseOrderInItemCheckEntity? {
        val id = PurchaseOrderInItemCheckId(updateDto.purchaseOrderNo, updateDto.purchaseOrderSeq)
        val entity = purchaseOrderInItemCheckRepository.findById(id).orElse(null) ?: return null

        // 엔티티의 불변성을 유지하기 위해 새 엔티티를 생성하여 반환
        val updatedEntity = PurchaseOrderInItemCheckEntity(
            id = entity.id,
            compCd = entity.compCd,
            itemCd = entity.itemCd,
            std = entity.std,
            unit = entity.unit,
            ordQty = entity.ordQty,
            ordPerson = entity.ordPerson,
            inspectionDate = LocalDateTime.now(),
            inspector = updateDto.inspector,
            note = entity.note,
            isApproved = updateDto.isApproved,
            inputDate = entity.inputDate,
            inputUser = entity.inputUser
        )

        return purchaseOrderInItemCheckRepository.save(updatedEntity)
    }

    /**
     * 여러 입고 검사 정보를 업데이트합니다.
     *
     * @param updateDtos 업데이트할 입고 검사 정보 목록
     * @return 업데이트된 입고 검사 엔티티 목록
     */
    @Transactional
    fun updatePurchaseOrderInItemChecks(updateDtos: List<IncomingInspectionRequest>): List<PurchaseOrderInItemCheckEntity> {
        val updatedEntities = mutableListOf<PurchaseOrderInItemCheckEntity>()

        for (updateDto in updateDtos) {
            val id = PurchaseOrderInItemCheckId(updateDto.purchaseOrderNo, updateDto.purchaseOrderSeq)
            val entity = purchaseOrderInItemCheckRepository.findById(id).orElse(null) ?: continue

            // 엔티티의 불변성을 유지하기 위해 새 엔티티를 생성
            val updatedEntity = PurchaseOrderInItemCheckEntity(
                id = entity.id,
                compCd = entity.compCd,
                itemCd = entity.itemCd,
                std = entity.std,
                unit = entity.unit,
                ordQty = entity.ordQty,
                ordPerson = entity.ordPerson,
                inspectionDate = LocalDateTime.now(),
                inspector = updateDto.inspector,
                note = entity.note,
                isApproved = updateDto.isApproved,
                inputDate = entity.inputDate,
                inputUser = entity.inputUser
            )

            updatedEntities.add(purchaseOrderInItemCheckRepository.save(updatedEntity))
        }

        return updatedEntities
    }
}
