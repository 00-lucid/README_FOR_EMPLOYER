package com.gmin.serverstandard.adapter.out.persistence.adapter

import com.gmin.serverstandard.adapter.out.persistence.mapper.CorrespondentMapper
import com.gmin.serverstandard.adapter.out.persistence.repository.SpringDataCorrespondentRepository
import com.gmin.serverstandard.application.domain.model.Correspondent
import com.gmin.serverstandard.application.port.out.DeleteCorrespondentPort
import com.gmin.serverstandard.application.port.out.LoadCorrespondentPort
import com.gmin.serverstandard.application.port.out.SaveCorrespondentPort
import org.springframework.stereotype.Component
import java.util.Optional

@Component
class CorrespondentPersistenceAdapter(
    private val correspondentRepository: SpringDataCorrespondentRepository,
    private val correspondentMapper: CorrespondentMapper
) : LoadCorrespondentPort, SaveCorrespondentPort, DeleteCorrespondentPort {
    /**
     * 모든 거래처를 조회합니다.
     *
     * @return 모든 거래처 목록 (Optional로 감싸져 있음)
     */
    override fun findAll(): Optional<List<Correspondent>> {
        val correspondents = correspondentRepository.findAll()
        return if (correspondents.isNotEmpty()) {
            Optional.of(correspondents.map { correspondentMapper.mapToDomainEntity(it) })
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 특정 ID의 거래처를 조회합니다.
     *
     * @param correspondentId 조회할 거래처 ID
     * @return 해당 ID의 거래처 (Optional로 감싸져 있음)
     */
    override fun findById(correspondentId: Int): Optional<Correspondent> {
        val correspondentOptional = correspondentRepository.findById(correspondentId)
        return if (correspondentOptional.isPresent) {
            Optional.of(correspondentMapper.mapToDomainEntity(correspondentOptional.get()))
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 특정 타입의 거래처를 조회합니다.
     *
     * @param type 조회할 거래처 타입
     * @return 해당 타입의 거래처 목록 (Optional로 감싸져 있음)
     */
    override fun findByType(type: String): Optional<List<Correspondent>> {
        val correspondents = correspondentRepository.findByType(type)
        return if (correspondents != null && correspondents.isNotEmpty()) {
            Optional.of(correspondents.map { correspondentMapper.mapToDomainEntity(it) })
        } else {
            Optional.empty()
        }
    }
    
    /**
     * 거래처를 저장합니다. (생성 또는 수정)
     *
     * @param correspondent 저장할 거래처 도메인 엔티티
     * @return 저장된 거래처 도메인 엔티티
     */
    override fun save(correspondent: Correspondent): Correspondent {
        val correspondentEntity = correspondentMapper.mapToJpaEntity(correspondent)
        val savedEntity = correspondentRepository.save(correspondentEntity)
        return correspondentMapper.mapToDomainEntity(savedEntity)
    }
    
    /**
     * 특정 ID의 거래처를 삭제합니다.
     *
     * @param correspondentId 삭제할 거래처 ID
     * @return 삭제 성공 여부
     */
    override fun deleteById(correspondentId: Int): Boolean {
        return try {
            correspondentRepository.deleteById(correspondentId)
            true
        } catch (e: Exception) {
            false
        }
    }
}