package com.gmin.serverstandard.adapter.out.persistence.adapter

import com.gmin.serverstandard.adapter.out.persistence.mapper.ItemMapper
import com.gmin.serverstandard.adapter.out.persistence.repository.SpringDataItemRepository
import com.gmin.serverstandard.application.domain.model.Item
import com.gmin.serverstandard.application.port.out.DeleteItemPort
import com.gmin.serverstandard.application.port.out.LoadItemPort
import com.gmin.serverstandard.application.port.out.SaveItemPort
import org.springframework.stereotype.Component
import java.util.Optional

@Component
class ItemPersistenceAdapter(
    private val itemRepository: SpringDataItemRepository,
    private val itemMapper: ItemMapper
) : LoadItemPort, SaveItemPort, DeleteItemPort {
    /**
     * 모든 품목을 조회합니다.
     *
     * @return 모든 품목 목록 (Optional로 감싸져 있음)
     */
    override fun findAll(): Optional<List<Item>> {
        val items = itemRepository.findAll()
        return if (items.isNotEmpty()) {
            Optional.of(items.map { itemMapper.mapToDomainEntity(it) })
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 특정 ID의 품목을 조회합니다.
     *
     * @param itemId 조회할 품목 ID
     * @return 해당 ID의 품목 (Optional로 감싸져 있음)
     */
    override fun findById(itemId: Int): Optional<Item> {
        val itemOptional = itemRepository.findById(itemId)
        return if (itemOptional.isPresent) {
            Optional.of(itemMapper.mapToDomainEntity(itemOptional.get()))
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 특정 회사의 품목을 조회합니다.
     *
     * @param companyId 조회할 회사 ID
     * @return 해당 회사의 품목 목록 (Optional로 감싸져 있음)
     */
    override fun findByCompanyId(companyId: Int): Optional<List<Item>> {
        val items = itemRepository.findByCompanyId(companyId)
        return if (items != null && items.isNotEmpty()) {
            Optional.of(items.map { itemMapper.mapToDomainEntity(it) })
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 특정 품목 타입의 품목을 조회합니다.
     *
     * @param itemType 조회할 품목 타입
     * @return 해당 타입의 품목 목록 (Optional로 감싸져 있음)
     */
    override fun findByItemType(itemType: String): Optional<List<Item>> {
        val items = itemRepository.findByItemType(itemType)
        return if (items != null && items.isNotEmpty()) {
            Optional.of(items.map { itemMapper.mapToDomainEntity(it) })
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 품목을 저장합니다. (생성 또는 수정)
     *
     * @param item 저장할 품목 도메인 엔티티
     * @return 저장된 품목 도메인 엔티티
     */
    override fun save(item: Item): Item {
        val itemEntity = itemMapper.mapToJpaEntity(item)
        val savedEntity = itemRepository.save(itemEntity)
        return itemMapper.mapToDomainEntity(savedEntity)
    }
    
    /**
     * 특정 ID의 품목을 삭제합니다.
     *
     * @param itemId 삭제할 품목 ID
     * @return 삭제 성공 여부
     */
    override fun deleteById(itemId: Int): Boolean {
        return try {
            itemRepository.deleteById(itemId)
            true
        } catch (e: Exception) {
            false
        }
    }
}