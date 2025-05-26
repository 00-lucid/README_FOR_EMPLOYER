package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Bom
import com.gmin.serverstandard.application.port.`in`.UpdateBomUseCase
import com.gmin.serverstandard.application.port.`in`.command.UpdateBomCommand
import com.gmin.serverstandard.application.port.out.LoadBomPort
import com.gmin.serverstandard.application.port.out.LoadItemPort
import com.gmin.serverstandard.application.port.out.SaveBomPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@UseCase
@Service
@Transactional
class UpdateBomService(
    private val loadBomPort: LoadBomPort,
    private val loadItemPort: LoadItemPort,
    private val saveBomPort: SaveBomPort
) : UpdateBomUseCase {
    /**
     * BOM 정보를 수정합니다.
     *
     * @param command BOM 수정 명령 객체
     * @return 수정된 BOM (성공/실패 여부를 포함한 Result 객체)
     */
    override fun updateBom(command: UpdateBomCommand): Result<Bom> {
        // 명령 유효성 검사
        val validationResult = command.validate()
        if (validationResult.isFailure) {
            return Result.failure(validationResult.exceptionOrNull() ?: IllegalArgumentException("BOM 수정 명령이 유효하지 않습니다."))
        }
        
        // 기존 BOM 존재 여부 확인
        val existingBomOptional = loadBomPort.findById(command.bomId)
        if (existingBomOptional.isEmpty) {
            return Result.failure(NoSuchElementException("ID가 ${command.bomId}인 BOM을 찾을 수 없습니다."))
        }
        
        try {
            val existingBom = existingBomOptional.get()
            
            // 수정된 BOM 생성
            val updatedBom = Bom(
                bomId = existingBom.bomId,
                bomStatus = command.bomStatus,
                bomVersion = command.bomVersion,
                remark = command.remark,
                createdAt = existingBom.createdAt,
                updatedAt = LocalDateTime.now()
            )
            
            // BOM 저장
            val savedBom = saveBomPort.save(updatedBom)
            return Result.success(savedBom)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
    
    /**
     * BOM에서 품목 정보를 수정합니다.
     *
     * @param bomId BOM ID
     * @param itemId 품목 ID
     * @param quantity 수정할 수량
     * @param remark 수정할 비고
     * @param parentItemId 수정할 부모 품목 ID
     * @return 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun updateItemInBom(
        bomId: Int,
        itemId: Int,
        quantity: Double,
        remark: String?,
        parentItemId: Int?
    ): Result<Boolean> {
        // BOM 존재 여부 확인
        val bomOptional = loadBomPort.findById(bomId)
        if (bomOptional.isEmpty) {
            return Result.failure(NoSuchElementException("ID가 ${bomId}인 BOM을 찾을 수 없습니다."))
        }
        
        // 품목 BOM 존재 여부 확인
        val itemBomOptional = loadBomPort.findItemBomByBomIdAndItemId(bomId, itemId)
        if (itemBomOptional.isEmpty) {
            return Result.failure(NoSuchElementException("BOM(ID: ${bomId})에 품목(ID: ${itemId})이 존재하지 않습니다."))
        }
        
        // 부모 품목 존재 여부 확인 (부모 품목이 지정된 경우)
        if (parentItemId != null) {
            // 부모 품목이 자기 자신인지 확인
            if (parentItemId == itemId) {
                return Result.failure(IllegalArgumentException("품목은 자기 자신을 부모로 가질 수 없습니다."))
            }
            
            val parentItemOptional = loadItemPort.findById(parentItemId)
            if (parentItemOptional.isEmpty) {
                return Result.failure(NoSuchElementException("ID가 ${parentItemId}인 부모 품목을 찾을 수 없습니다."))
            }
            
            // 부모 품목이 이미 BOM에 존재하는지 확인
            val parentItemBomOptional = loadBomPort.findItemBomByBomIdAndItemId(bomId, parentItemId)
            if (parentItemBomOptional.isEmpty) {
                return Result.failure(IllegalArgumentException("부모 품목(ID: ${parentItemId})이 BOM에 존재하지 않습니다."))
            }
            
            // 순환 참조 확인 (부모 품목의 조상 중에 현재 품목이 있는지 확인)
            if (isCircularReference(bomId, itemId, parentItemId)) {
                return Result.failure(IllegalArgumentException("순환 참조가 발생합니다. 부모 품목(ID: ${parentItemId})의 조상 중에 현재 품목(ID: ${itemId})이 있습니다."))
            }
        }
        
        try {
            val existingItemBom = itemBomOptional.get()
            
            // 수정된 품목 BOM 생성
            val updatedItemBom = existingItemBom.copy(
                quantity = quantity,
                remark = remark,
                parentItemId = parentItemId
            )
            
            // 품목 BOM 저장
            saveBomPort.saveItemBom(updatedItemBom)
            return Result.success(true)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
    
    /**
     * BOM에서 품목을 제거합니다.
     *
     * @param bomId BOM ID
     * @param itemId 제거할 품목 ID
     * @return 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun removeItemFromBom(bomId: Int, itemId: Int): Result<Boolean> {
        // BOM 존재 여부 확인
        val bomOptional = loadBomPort.findById(bomId)
        if (bomOptional.isEmpty) {
            return Result.failure(NoSuchElementException("ID가 ${bomId}인 BOM을 찾을 수 없습니다."))
        }
        
        // 품목 BOM 존재 여부 확인
        val itemBomOptional = loadBomPort.findItemBomByBomIdAndItemId(bomId, itemId)
        if (itemBomOptional.isEmpty) {
            return Result.failure(NoSuchElementException("BOM(ID: ${bomId})에 품목(ID: ${itemId})이 존재하지 않습니다."))
        }
        
        // 이 품목을 부모로 하는 다른 품목이 있는지 확인
        val allItemBoms = loadBomPort.findItemBomsByBomId(bomId).orElse(emptyList())
        val childItems = allItemBoms.filter { it.parentItemId == itemId }
        
        if (childItems.isNotEmpty()) {
            return Result.failure(IllegalArgumentException("이 품목(ID: ${itemId})을 부모로 하는 다른 품목이 있어 삭제할 수 없습니다."))
        }
        
        try {
            // 품목 BOM 삭제
            val deleted = saveBomPort.deleteItemBom(bomId, itemId)
            return Result.success(deleted)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
    
    /**
     * 순환 참조 여부를 확인합니다.
     *
     * @param bomId BOM ID
     * @param itemId 현재 품목 ID
     * @param parentItemId 부모 품목 ID
     * @return 순환 참조 여부
     */
    private fun isCircularReference(bomId: Int, itemId: Int, parentItemId: Int): Boolean {
        // 모든 품목 BOM 조회
        val allItemBoms = loadBomPort.findItemBomsByBomId(bomId).orElse(emptyList())
        
        // 부모 품목의 조상 목록 구하기
        val ancestors = mutableSetOf<Int>()
        var currentParentId: Int? = parentItemId
        
        while (currentParentId != null) {
            // 이미 조상 목록에 있는 경우 순환 참조
            if (currentParentId in ancestors) {
                return true
            }
            
            ancestors.add(currentParentId)
            
            // 현재 품목이 조상 목록에 있는 경우 순환 참조
            if (itemId == currentParentId) {
                return true
            }
            
            // 다음 부모 찾기
            currentParentId = allItemBoms.find { it.itemId == currentParentId }?.parentItemId
        }
        
        return false
    }
}