package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Bom
import com.gmin.serverstandard.application.domain.model.ItemBom
import com.gmin.serverstandard.application.port.`in`.CreateBomUseCase
import com.gmin.serverstandard.application.port.`in`.command.CreateBomCommand
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
class CreateBomService(
    private val loadBomPort: LoadBomPort,
    private val loadItemPort: LoadItemPort,
    private val saveBomPort: SaveBomPort
) : CreateBomUseCase {
    /**
     * 새로운 BOM을 생성합니다.
     *
     * @param command BOM 생성 명령 객체
     * @return 생성된 BOM (성공/실패 여부를 포함한 Result 객체)
     */
    override fun createBom(command: CreateBomCommand): Result<Bom> {
        // 명령 유효성 검사
        val validationResult = command.validate()
        if (validationResult.isFailure) {
            return Result.failure(validationResult.exceptionOrNull() ?: IllegalArgumentException("BOM 생성 명령이 유효하지 않습니다."))
        }
        
        try {
            // 새 BOM 생성
            val now = LocalDateTime.now()
            val newBom = Bom(
                bomId = 0, // 저장 시 자동 생성됨
                bomStatus = command.bomStatus,
                bomVersion = command.bomVersion,
                remark = command.remark,
                createdAt = now,
                updatedAt = now
            )
            
            // BOM 저장
            val savedBom = saveBomPort.save(newBom)
            return Result.success(savedBom)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
    
    /**
     * BOM에 품목을 추가합니다.
     *
     * @param bomId 품목을 추가할 BOM ID
     * @param itemId 추가할 품목 ID
     * @param quantity 수량
     * @param remark 비고
     * @param parentItemId 부모 품목 ID (null인 경우 최상위 품목)
     * @return 성공 여부 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun addItemToBom(
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
        
        // 품목 존재 여부 확인
        val itemOptional = loadItemPort.findById(itemId)
        if (itemOptional.isEmpty) {
            return Result.failure(NoSuchElementException("ID가 ${itemId}인 품목을 찾을 수 없습니다."))
        }
        
        // 부모 품목 존재 여부 확인 (부모 품목이 지정된 경우)
        if (parentItemId != null) {
            val parentItemOptional = loadItemPort.findById(parentItemId)
            if (parentItemOptional.isEmpty) {
                return Result.failure(NoSuchElementException("ID가 ${parentItemId}인 부모 품목을 찾을 수 없습니다."))
            }
            
            // 부모 품목이 이미 BOM에 존재하는지 확인
            val parentItemBomOptional = loadBomPort.findItemBomByBomIdAndItemId(bomId, parentItemId)
            if (parentItemBomOptional.isEmpty) {
                return Result.failure(IllegalArgumentException("부모 품목(ID: ${parentItemId})이 BOM에 존재하지 않습니다."))
            }
        }
        
        // 품목이 이미 BOM에 존재하는지 확인
        val existingItemBomOptional = loadBomPort.findItemBomByBomIdAndItemId(bomId, itemId)
        if (existingItemBomOptional.isPresent) {
            return Result.failure(IllegalArgumentException("품목(ID: ${itemId})이 이미 BOM에 존재합니다."))
        }
        
        try {
            // 새 품목 BOM 생성
            val newItemBom = ItemBom(
                bomId = bomId,
                itemId = itemId,
                quantity = quantity,
                remark = remark,
                parentItemId = parentItemId
            )
            
            // 품목 BOM 저장
            saveBomPort.saveItemBom(newItemBom)
            return Result.success(true)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
}