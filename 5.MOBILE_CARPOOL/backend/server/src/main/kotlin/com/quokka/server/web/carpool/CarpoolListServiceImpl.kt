package com.quokka.server.web.carpool

import com.quokka.server.domain.passenger.Location
import com.quokka.server.domain.user.UserRepository
import com.quokka.server.web.match.MatchRepository
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.format.DateTimeFormatter

@Service
class CarpoolListServiceImpl(
        private val carpoolListRepository: CarpoolListRepository,
        private val userRepository: UserRepository,
        private val matchRepository: MatchRepository,
        val mongoTemplate: MongoTemplate
): CarpoolListService {
    override fun findCompleteUserCarpoolList(userId: String, page: Int): List<CarpoolList> {
        val user = userRepository.findByUserId(userId) ?: error("Cannot get carpoolList with userId ${userId}. does not exist.")

        val pageSize = 10 // 페이지 크기
        val pageNumber = page - 1 // 요청된 페이지 번호를 0부터 시작하는 인덱스로 변환
        val sort = Sort.by(Sort.Direction.DESC, "carpoolId") // carpoolId 필드를 기준으로 내림차순 정렬
        val pageable = PageRequest.of(pageNumber, pageSize, sort)

        return carpoolListRepository.findByOwner(user.userId!!, pageable)
    }

    override fun findInCompleteUserCarpoolList(userId: String, page: Int): List<CarpoolList> {
        val user = userRepository.findByUserId(userId) ?: error("Cannot get carpoolList with userId ${userId}. does not exist.")

        val pageSize = 10 // 페이지 크기
        val pageNumber = page - 1 // 요청된 페이지 번호를 0부터 시작하는 인덱스로 변환
        val sort = Sort.by(Sort.Direction.DESC, "carpoolId") // carpoolId 필드를 기준으로 내림차순 정렬
        val pageable = PageRequest.of(pageNumber, pageSize, sort)


        return carpoolListRepository.findByOwner(user.userId!!, pageable)
    }

    override fun addUserCarpoolList(userId: String, carpoolListRequest: CarpoolListRequest): CarpoolList {
        // TODO userId 통한 검증
        val user = userRepository.findByUserId(userId) ?: error("Cannot get carpoolList with userId ${userId}. does not exist.")

        val list = carpoolListRepository.findAll().sortedByDescending { it.carpoolId }
        var newCarpoolList: CarpoolList? = null

        // TODO 7~11 오전, 16~22 오후
        val isMorning = checkTimeRange(carpoolListRequest.time) ?: error("Cannot add Carpool because invalid time range.")

        if (list.isNotEmpty()) {
            newCarpoolList = CarpoolList(
                    list[0]?.carpoolId?.plus(1) ?: 1,
                    carpoolListRequest.boardingAddress,
                    carpoolListRequest.destinationAddress,
                    carpoolListRequest.time,
                    carpoolListRequest.role,
                    carpoolListRequest.ableBothRole,
                    carpoolListRequest.etc,
                    user.userId,
                    Status.INIT,
                    isMorning
            )
        } else {
            newCarpoolList = CarpoolList(
                    1,
                    carpoolListRequest.boardingAddress,
                    carpoolListRequest.destinationAddress,
                    carpoolListRequest.time,
                    carpoolListRequest.role,
                    carpoolListRequest.ableBothRole,
                    carpoolListRequest.etc,
                    user.userId,
                    Status.INIT,
                    isMorning
            )
        }

        return carpoolListRepository.save(newCarpoolList)
    }

    override fun updateUserCarpoolListState(userId: String, carpoolId: Int, carpoolListStatus: CarpoolListStatusRequest): CarpoolList {
        // TODO userId 통한 검증
        val carpoolList = carpoolListRepository.findByCarpoolId(carpoolId)
        val query = Query(Criteria.where("carpoolId").`is`(carpoolList.carpoolId))
        val update = Update().set("carpoolStatus", carpoolListStatus.status.name)
        val result = mongoTemplate.updateFirst(query, update, "carpools")

        if (carpoolListStatus.status.name == "COMPLETED") {
            // TODO 매칭 정보 업데이트
            if (carpoolList.role.name == "Driver") {
                val match = matchRepository.findByDriverCarpoolIdAndEnd(carpoolId, false) ?: error("Cannot get Match by carpoolId.")
                if (!match.end) {
                    // matchRepository.updateEndByDriverCarpoolId(carpoolId, true)
                }
            } else {
                val match = matchRepository.findByPassengerCarpoolIdAndEnd(carpoolId, false) ?: error("Cannot get Match by carpoolId.")
                if (!match.end) {
                    // matchRepository.updateEndByPassengerCarpoolId(carpoolId, true)
                }
            }
        }

        return carpoolList
    }

    override fun removeUserCarpoolList(userId: String, carpoolId: Int): CarpoolList {
        // TODO userId 통한 검증
        val target = carpoolListRepository.findByCarpoolId(carpoolId)
        carpoolListRepository.deleteByCarpoolId(carpoolId)
        return target
    }

    override fun findUserCarpoolListDetail(userId: String, carpoolId: Int): CarpoolListDetail {
        // !! nullable 처리 필요
        val user = userRepository.findByUserId(userId) ?: error("Cannot get user with userId ${userId}. does not exist.")
        val carpoolList = carpoolListRepository.findByCarpoolId(carpoolId)
        val role = carpoolList.role

        // TODO 해당 if 문 matchServiceImpl과 조합할 수 있어야 함
        if (role.name == "Driver") {
            val match = matchRepository.findByDriverCarpoolIdAndEnd(carpoolId, false)
                    ?: return CarpoolListDetail(
                            user,
                            null,
                            carpoolList,
                            null,
                            carpoolList.boardingAddress,
                            null,
                            carpoolList.destinationAddress,
                            carpoolList.time,
                            carpoolList.carpoolStatus
                    )

            val passengerCarpoolList = carpoolListRepository.findByCarpoolId(match.passengerCarpoolId)
            // owner is userId and must not null
            val passenger = userRepository.findByUserId(passengerCarpoolList.owner!!) ?: error("Cannot get another user with userId ${userId}. does not exist.")

            return CarpoolListDetail(
                    user,
                    passenger,
                    carpoolList,
                    passengerCarpoolList,
                    carpoolList.boardingAddress,
                    passengerCarpoolList.boardingAddress,
                    carpoolList.destinationAddress,
                    carpoolList.time,
                    carpoolList.carpoolStatus
            )
        } else {
            val match = matchRepository.findByPassengerCarpoolIdAndEnd(carpoolId, false)
                    ?: return CarpoolListDetail(
                            null,
                            user,
                            null,
                            carpoolList,
                            carpoolList.boardingAddress,
                            null,
                            carpoolList.destinationAddress,
                            carpoolList.time,
                            carpoolList.carpoolStatus
                    )
            val driverCarpoolList = carpoolListRepository.findByCarpoolId(match.driverCarpoolId)
            val driver = userRepository.findByUserId(driverCarpoolList.owner!!) ?: error("Cannot get another user with userId ${userId}. does not exist.")

            return CarpoolListDetail(
                    driver,
                    user,
                    driverCarpoolList,
                    carpoolList,
                    driverCarpoolList.boardingAddress,
                    carpoolList.boardingAddress,
                    driverCarpoolList.destinationAddress,
                    driverCarpoolList.time,
                    driverCarpoolList.carpoolStatus
            )
        }
    }
}

fun checkTimeRange(timeString: String): Boolean? {
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
    val time = LocalDateTime.parse(timeString, formatter)

    val morningStart = LocalTime.of(6, 0)
    val morningEnd = LocalTime.of(11, 0)
    val eveningStart = LocalTime.of(16, 0)
    val eveningEnd = LocalTime.of(22, 0)

    val currentTime = time.toLocalTime()

    return when {
        currentTime in morningStart..morningEnd -> true
        currentTime in eveningStart..eveningEnd -> false
        else -> null
    }
}