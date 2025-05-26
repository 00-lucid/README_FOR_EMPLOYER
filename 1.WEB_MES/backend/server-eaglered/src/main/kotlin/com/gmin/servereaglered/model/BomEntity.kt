package com.gmin.servereaglered.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "Bom", schema = "dbo")
data class BomEntity(

    @Id
    @Column(name = "BomCd", nullable = false, length = 40)
    var bomCd: String,

    @Column(name = "CompCd", nullable = false, length = 8)
    var compCd: String,

    @Column(name = "ItemCd", nullable = false, length = 40)
    var itemCd: String,

    @Column(name = "RevisionNo", nullable = false, length = 40)
    var revisionNo: String,

    @Column(name = "PartCd", nullable = false, length = 40)
    var partCd: String,

    @Column(name = "Quantity", nullable = false, precision = 18, scale = 4)
    var quantity: BigDecimal,

    @Column(name = "ExpirationDate", nullable = false, length = 10)
    var expirationDate: String, // 필요하다면 LocalDate 타입으로 변경하고 파싱 로직을 추가할 수 있습니다.

    @Column(name = "InputDate", nullable = false)
    var inputDate: LocalDateTime,

    @Column(name = "InputUser", nullable = false, length = 20)
    var inputUser: String
)