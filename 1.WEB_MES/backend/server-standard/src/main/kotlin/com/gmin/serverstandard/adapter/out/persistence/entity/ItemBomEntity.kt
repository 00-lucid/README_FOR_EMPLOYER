package com.gmin.serverstandard.adapter.out.persistence.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.IdClass
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.io.Serializable

/**
 * ItemBom 엔티티의 복합 키 클래스
 */
data class ItemBomId(
    val itemId: Int = 0,
    val bomId: Int = 0
) : Serializable

@Entity
@Table(name = "ItemBoms")
@IdClass(ItemBomId::class)
class ItemBomEntity(
    @Id
    @Column(name = "ItemId")
    val itemId: Int,
    
    @Id
    @Column(name = "BomId")
    val bomId: Int,
    
    @Column(name = "Quantity", nullable = false)
    val quantity: Double,
    
    @Column(name = "Remark", columnDefinition = "nvarchar(max)")
    val remark: String?,
    
    @Column(name = "ParentItemId")
    val parentItemId: Int?
) {
    @ManyToOne
    @JoinColumn(name = "ItemId", insertable = false, updatable = false)
    lateinit var item: ItemEntity
    
    @ManyToOne
    @JoinColumn(name = "BomId", insertable = false, updatable = false)
    lateinit var bom: BomEntity
    
    @ManyToOne
    @JoinColumn(name = "ParentItemId", insertable = false, updatable = false)
    var parentItem: ItemEntity? = null
}