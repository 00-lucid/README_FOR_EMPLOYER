package com.quokka.server.web.carpool

interface CarpoolListService {
    fun findCompleteUserCarpoolList(userId: String, page: Int): List<CarpoolList>
    fun findInCompleteUserCarpoolList(userId: String, page: Int): List<CarpoolList>
    fun addUserCarpoolList(userId: String, carpoolListRequest: CarpoolListRequest): CarpoolList
    fun updateUserCarpoolListState(userId: String, carpoolId: Int, carpoolListStatus: CarpoolListStatusRequest): CarpoolList
    fun removeUserCarpoolList(userId: String, carpoolId: Int): CarpoolList
    fun findUserCarpoolListDetail(userId: String, carpoolId: Int): CarpoolListDetail
//    fun editUserCarpoolListState(userId: Unit, carpoolId: Unit, carpoolListStatus: Unit)
}