package com.gmin.serverstandard.application.domain.service

import com.gmin.serverstandard.application.domain.model.Bom
import com.gmin.serverstandard.application.domain.model.ItemBom
import com.gmin.serverstandard.application.port.`in`.GetBomUseCase
import com.gmin.serverstandard.application.port.out.LoadBomPort
import com.gmin.serverstandard.common.UseCase
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@UseCase
@Service
@Transactional(readOnly = true)
class GetBomService(
    private val loadBomPort: LoadBomPort
) : GetBomUseCase {
    /**
     * 모든 BOM을 조회합니다.
     *
     * @return 모든 BOM 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getAllBoms(): Result<List<Bom>> {
        val bomsOptional = loadBomPort.findAll()
        
        return if (bomsOptional.isEmpty) {
            Result.success(emptyList()) // BOM이 없는 경우 빈 리스트 반환
        } else {
            try {
                Result.success(bomsOptional.get())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    /**
     * 특정 ID의 BOM을 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 ID의 BOM (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getBomById(bomId: Int): Result<Bom> {
        val bomOptional = loadBomPort.findById(bomId)
        
        return if (bomOptional.isEmpty) {
            Result.failure(NoSuchElementException("ID가 ${bomId}인 BOM을 찾을 수 없습니다."))
        } else {
            try {
                Result.success(bomOptional.get())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    /**
     * 특정 상태의 BOM을 조회합니다.
     *
     * @param bomStatus 조회할 BOM 상태
     * @return 해당 상태의 BOM 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getBomsByStatus(bomStatus: String): Result<List<Bom>> {
        // BOM 상태 유효성 검사
        if (!Bom.isValidBomStatus(bomStatus)) {
            return Result.failure(IllegalArgumentException("유효하지 않은 BOM 상태입니다: $bomStatus"))
        }
        
        val bomsOptional = loadBomPort.findByStatus(bomStatus)
        
        return if (bomsOptional.isEmpty) {
            Result.success(emptyList()) // BOM이 없는 경우 빈 리스트 반환
        } else {
            try {
                Result.success(bomsOptional.get())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    /**
     * 특정 BOM에 속한 품목 목록을 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 BOM에 속한 품목 BOM 목록 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getItemBomsByBomId(bomId: Int): Result<List<ItemBom>> {
        // BOM 존재 여부 확인
        val bomOptional = loadBomPort.findById(bomId)
        if (bomOptional.isEmpty) {
            return Result.failure(NoSuchElementException("ID가 ${bomId}인 BOM을 찾을 수 없습니다."))
        }
        
        val itemBomsOptional = loadBomPort.findItemBomsByBomId(bomId)
        
        return if (itemBomsOptional.isEmpty) {
            Result.success(emptyList()) // 품목 BOM이 없는 경우 빈 리스트 반환
        } else {
            try {
                Result.success(itemBomsOptional.get())
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }
    
    /**
     * 특정 BOM에 속한 품목 목록을 트리 구조로 조회합니다.
     *
     * @param bomId 조회할 BOM ID
     * @return 해당 BOM에 속한 품목 BOM 트리 구조 (성공/실패 여부를 포함한 Result 객체)
     */
    override fun getItemBomTreeByBomId(bomId: Int): Result<List<GetBomUseCase.ItemBomTreeNode>> {
        // BOM 존재 여부 확인
        val bomOptional = loadBomPort.findById(bomId)
        if (bomOptional.isEmpty) {
            return Result.failure(NoSuchElementException("ID가 ${bomId}인 BOM을 찾을 수 없습니다."))
        }
        
        // 모든 ItemBom 조회
        val itemBomsResult = getItemBomsByBomId(bomId)
        if (itemBomsResult.isFailure) {
            return Result.failure(itemBomsResult.exceptionOrNull() ?: Exception("품목 BOM 조회 중 오류가 발생했습니다."))
        }
        
        val itemBoms = itemBomsResult.getOrNull() ?: emptyList()
        if (itemBoms.isEmpty()) {
            return Result.success(emptyList())
        }
        
        try {
            // 트리 구조 생성
            val treeNodes = buildItemBomTree(itemBoms)
            return Result.success(treeNodes)
        } catch (e: Exception) {
            return Result.failure(e)
        }
    }
    
    /**
     * 품목 BOM 목록을 트리 구조로 변환합니다.
     *
     * @param itemBoms 품목 BOM 목록
     * @return 트리 구조로 변환된 품목 BOM 노드 목록
     */
    private fun buildItemBomTree(itemBoms: List<ItemBom>): List<GetBomUseCase.ItemBomTreeNode> {
        // 부모 품목 ID가 null인 최상위 품목 찾기
        val rootItems = itemBoms.filter { it.parentItemId == null }
        
        // 각 최상위 품목에 대해 재귀적으로 자식 품목 찾기
        return rootItems.map { rootItem ->
            buildItemBomTreeNode(rootItem, itemBoms)
        }
    }
    
    /**
     * 재귀적으로 품목 BOM 트리 노드를 생성합니다.
     *
     * @param itemBom 현재 품목 BOM
     * @param allItemBoms 모든 품목 BOM 목록
     * @return 생성된 품목 BOM 트리 노드
     */
    private fun buildItemBomTreeNode(itemBom: ItemBom, allItemBoms: List<ItemBom>): GetBomUseCase.ItemBomTreeNode {
        // 현재 품목을 부모로 하는 자식 품목 찾기
        val children = allItemBoms.filter { it.parentItemId == itemBom.itemId }
        
        // 자식 품목이 없으면 리프 노드 반환
        if (children.isEmpty()) {
            return GetBomUseCase.ItemBomTreeNode(itemBom)
        }
        
        // 자식 품목에 대해 재귀적으로 트리 노드 생성
        val childNodes = children.map { childItem ->
            buildItemBomTreeNode(childItem, allItemBoms)
        }
        
        // 현재 품목과 자식 노드로 트리 노드 생성
        return GetBomUseCase.ItemBomTreeNode(itemBom, childNodes)
    }
}