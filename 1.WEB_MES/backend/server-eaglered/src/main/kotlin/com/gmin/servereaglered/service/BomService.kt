package com.gmin.servereaglered.service

import com.gmin.servereaglered.model.BomEntity
import com.gmin.servereaglered.repository.BomRepository
import com.gmin.serverstandard.adapter.`in`.web.dto.BomDto
import com.gmin.serverstandard.adapter.`in`.web.dto.ItemPartListDto
import com.gmin.serverstandard.adapter.`in`.web.dto.PartInfoDto
import org.springframework.stereotype.Service
import java.util.NoSuchElementException
import java.math.BigDecimal

@Service
class BomService(
    private val bomRepository: BomRepository,
    private val stockTransactionService: StockTransactionService
) {
    /**
     * 품목 코드(itemCd)로 해당 아이템의 자재 코드(PartCd) 목록, 소요량, 그리고 자재 보유량을 조회합니다.
     * 소요량(quantity)은 완제품 한 개당 필요한 자재의 양을 나타냅니다.
     * 자재 보유량(inventoryAmount)은 현재 해당 자재의 재고 수량을 나타냅니다.
     *
     * @param itemCd 품목 코드
     * @return 품목에 대한 자재 코드 목록, 소요량, 자재 보유량 DTO
     * @throws NoSuchElementException 해당 품목 코드에 대한 BOM 정보가 없을 경우
     */
    fun getPartsByItemCd(itemCd: String): ItemPartListDto {
        val bomEntities = bomRepository.findByItemCd(itemCd)

        if (bomEntities.isEmpty()) {
            throw NoSuchElementException("BOM information not found for item code: $itemCd")
        }

        val partInfoList = bomEntities.map { entity ->
            // 각 자재 코드에 대한 재고량 조회
            val inventoryAmount = stockTransactionService.getInventoryQuantityByItemCode(entity.partCd)

            PartInfoDto(
                partCd = entity.partCd,
                quantity = entity.quantity,
                inventoryAmount = inventoryAmount
            )
        }

        return ItemPartListDto(
            itemCd = itemCd,
            parts = partInfoList
        )
    }

    /**
     * BomEntity를 BomDto로 변환합니다.
     *
     * @param entity BOM 엔티티
     * @return 변환된 BOM DTO
     */
    private fun mapToDto(entity: BomEntity): BomDto {
        return BomDto(
            bomCd = entity.bomCd,
            compCd = entity.compCd,
            itemCd = entity.itemCd,
            revisionNo = entity.revisionNo,
            partCd = entity.partCd,
            quantity = entity.quantity,
            expirationDate = entity.expirationDate,
            inputDate = entity.inputDate,
            inputUser = entity.inputUser
        )
    }
}
