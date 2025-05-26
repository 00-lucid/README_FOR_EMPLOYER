package com.quokka.server.web.carpool

import org.springframework.data.domain.Pageable
import org.springframework.data.mongodb.repository.MongoRepository
import org.springframework.stereotype.Repository

@Repository
interface CarpoolListRepository : MongoRepository<CarpoolList, String> {
    fun deleteByCarpoolId(carpoolId: Int)
    fun findByCarpoolId(carpoolId: Int): CarpoolList
    fun findByOwner(userId: String, pageable: Pageable): List<CarpoolList>
    // TODO carpoolStatus: Status 형태로 받을 수 있나 확인 필요
    fun findByCarpoolStatus(carpoolStatus: String): List<CarpoolList>
}