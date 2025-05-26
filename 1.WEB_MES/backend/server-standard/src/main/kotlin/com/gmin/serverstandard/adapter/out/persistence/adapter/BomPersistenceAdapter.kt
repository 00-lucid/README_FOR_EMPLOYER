package com.gmin.serverstandard.adapter.out.persistence.adapter

import com.gmin.serverstandard.adapter.out.persistence.mapper.BomMapper
import com.gmin.serverstandard.adapter.out.persistence.mapper.ItemBomMapper
import com.gmin.serverstandard.adapter.out.persistence.repository.SpringDataBomRepository
import com.gmin.serverstandard.adapter.out.persistence.repository.SpringDataItemBomRepository
import com.gmin.serverstandard.application.domain.model.Bom
import com.gmin.serverstandard.application.domain.model.ItemBom
import com.gmin.serverstandard.application.port.out.DeleteBomPort
import com.gmin.serverstandard.application.port.out.LoadBomPort
import com.gmin.serverstandard.application.port.out.SaveBomPort
import org.springframework.stereotype.Component
import java.util.Optional

@Component
class BomPersistenceAdapter(
    private val bomRepository: SpringDataBomRepository,
    private val itemBomRepository: SpringDataItemBomRepository,
    private val bomMapper: BomMapper,
    private val itemBomMapper: ItemBomMapper
) : LoadBomPort, SaveBomPort, DeleteBomPort {
    /**
     * 모든 BOM을 조회합니다.
     *
     * @return 모든 BOM 목록 (Optional로 감싸져 있음)
     */
    override fun findAll(): Optional<List<Bom>> {
        val boms = bomRepository.findAll()
        return if (boms.isNotEmpty()) {
            Optional.of(boms.map { bomMapper.mapToDomainEntity(it) })
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 특정 ID의 BOM을 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 ID의 BOM (Optional로 감싸져 있음)
     */
    override fun findById(bomId: Int): Optional<Bom> {
        val bomOptional = bomRepository.findById(bomId)
        return if (bomOptional.isPresent) {
            Optional.of(bomMapper.mapToDomainEntity(bomOptional.get()))
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 특정 상태의 BOM을 조회합니다.
     *
     * @param bomStatus 조회할 BOM 상태
     * @return 해당 상태의 BOM 목록 (Optional로 감싸져 있음)
     */
    override fun findByStatus(bomStatus: String): Optional<List<Bom>> {
        val boms = bomRepository.findByBomStatus(bomStatus)
        return if (boms != null && boms.isNotEmpty()) {
            Optional.of(boms.map { bomMapper.mapToDomainEntity(it) })
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 특정 BOM에 속한 품목 목록을 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 BOM에 속한 품목 BOM 목록 (Optional로 감싸져 있음)
     */
    override fun findItemBomsByBomId(bomId: Int): Optional<List<ItemBom>> {
        val itemBoms = itemBomRepository.findByBomId(bomId)
        return if (itemBoms != null && itemBoms.isNotEmpty()) {
            Optional.of(itemBoms.map { itemBomMapper.mapToDomainEntity(it) })
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 특정 BOM과 품목 ID로 ItemBom을 조회합니다.
     *
     * @param bomId BOM ID
     * @param itemId 품목 ID
     * @return 해당 BOM과 품목의 ItemBom (Optional로 감싸져 있음)
     */
    override fun findItemBomByBomIdAndItemId(bomId: Int, itemId: Int): Optional<ItemBom> {
        val itemBom = itemBomRepository.findByBomIdAndItemId(bomId, itemId)
        return if (itemBom != null) {
            Optional.of(itemBomMapper.mapToDomainEntity(itemBom))
        } else {
            Optional.empty()
        }
    }
    
    /**
     * BOM을 저장합니다. (생성 또는 수정)
     *
     * @param bom 저장할 BOM 도메인 엔티티
     * @return 저장된 BOM 도메인 엔티티
     */
    override fun save(bom: Bom): Bom {
        val bomEntity = bomMapper.mapToJpaEntity(bom)
        val savedEntity = bomRepository.save(bomEntity)
        return bomMapper.mapToDomainEntity(savedEntity)
    }
    
    /**
     * 품목 BOM을 저장합니다. (생성 또는 수정)
     *
     * @param itemBom 저장할 품목 BOM 도메인 엔티티
     * @return 저장된 품목 BOM 도메인 엔티티
     */
    override fun saveItemBom(itemBom: ItemBom): ItemBom {
        val itemBomEntity = itemBomMapper.mapToJpaEntity(itemBom)
        val savedEntity = itemBomRepository.save(itemBomEntity)
        return itemBomMapper.mapToDomainEntity(savedEntity)
    }
    
    /**
     * 품목 BOM을 삭제합니다.
     *
     * @param bomId BOM ID
     * @param itemId 품목 ID
     * @return 삭제 성공 여부
     */
    override fun deleteItemBom(bomId: Int, itemId: Int): Boolean {
        return try {
            itemBomRepository.deleteByBomIdAndItemId(bomId, itemId)
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * 특정 ID의 BOM을 삭제합니다.
     *
     * @param bomId 삭제할 BOM ID
     * @return 삭제 성공 여부
     */
    override fun deleteById(bomId: Int): Boolean {
        return try {
            bomRepository.deleteById(bomId)
            true
        } catch (e: Exception) {
            false
        }
    }
}