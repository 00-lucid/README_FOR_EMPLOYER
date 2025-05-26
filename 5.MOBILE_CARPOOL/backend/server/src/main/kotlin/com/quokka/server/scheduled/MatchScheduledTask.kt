package com.quokka.server.scheduled

//import com.google.common.geometry.S2CellId
//import com.google.common.geometry.S2LatLng
import com.quokka.server.domain.match.Match
import com.quokka.server.domain.passenger.Location
import com.quokka.server.web.carpool.*
import com.quokka.server.web.chat.ChatController
import com.quokka.server.web.chat.CreateChatDto
import com.quokka.server.web.match.MatchRepository
//import com.quokka.server.web.match.MatchService
import org.springframework.scheduling.annotation.EnableScheduling
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import kotlin.math.*

@Component
@EnableScheduling
class MatchScheduledTask(
        private val carpoolListRepository: CarpoolListRepository,
        private val carpoolListService: CarpoolListService,
        private val matchRepository: MatchRepository,
        private val chatController: ChatController
//        private val matchService: MatchService
) {
    @Scheduled(cron = "0 0 15 * * ?")
    fun runAfternoonMatch() {
        // TODO 당일 15~24시 사이의 카풀들 매칭
        // 거리 알고리즘 기반으로 두 개의 카풀리스트를 짝지어준다
        val list = carpoolListRepository.findByCarpoolStatus(Status.INIT.name)
        // 각 카풀리스트의 Status를 MATCHED 상태로 변경한다
        matchCarpools(list).forEach {
            val carpoolListStatus = CarpoolListStatusRequest(
                    Status.MATCHED
            )
            carpoolListService.updateUserCarpoolListState(it.carpool1.owner!!, it.carpool1.carpoolId!!, carpoolListStatus)
            carpoolListService.updateUserCarpoolListState(it.carpool2.owner!!, it.carpool2.carpoolId!!, carpoolListStatus)

            // 매칭 정보 기반으로 Match를 만든다
            if (it.carpool1.role.name!! == "Driver") {
                val match = Match(
                        it.carpool1.carpoolId!!,
                        it.carpool2.carpoolId!!,
                        false
                )

                matchRepository.save(match)
            } else {
                val match = Match(
                        it.carpool2.carpoolId!!,
                        it.carpool1.carpoolId!!,
                        false
                )

                matchRepository.save(match)
            }

            val list = ArrayList<String>()
            list.add(it.carpool1.owner!!)
            list.add(it.carpool2.owner!!)
            chatController.create(CreateChatDto(list))
        }
    }

    @Scheduled(cron = "0 0 22 * * ?")
    fun runMorningMatch() {
        // TODO 다음날 6~15시 사이의 카풀들 매칭
        val list = carpoolListRepository.findByCarpoolStatus(Status.INIT.name)

        matchCarpools(list).forEach {
            val carpoolListStatus = CarpoolListStatusRequest(
                    Status.MATCHED
            )
            carpoolListService.updateUserCarpoolListState(it.carpool1.owner!!, it.carpool1.carpoolId!!, carpoolListStatus)
            carpoolListService.updateUserCarpoolListState(it.carpool2.owner!!, it.carpool2.carpoolId!!, carpoolListStatus)

            if (it.carpool1.role.name!! == "Driver") {
                val match = Match(
                        it.carpool1.carpoolId!!,
                        it.carpool2.carpoolId!!,
                        false
                )

                matchRepository.save(match)
            } else {
                val match = Match(
                        it.carpool2.carpoolId!!,
                        it.carpool1.carpoolId!!,
                        false
                )

                matchRepository.save(match)
            }

            val list = ArrayList<String>()
            list.add(it.carpool1.owner!!)
            list.add(it.carpool2.owner!!)
            chatController.create(CreateChatDto(list))
        }
    }

//    @Scheduled(cron = "0 19 22 * * ?")
//    fun runTestMatch() {
//        val list = carpoolListRepository.findByCarpoolStatus(Status.INIT.name)
//
//        matchCarpools(list).forEach {
//            val carpoolListStatus = CarpoolListStatusRequest(
//                    Status.MATCHED
//            )
//            carpoolListService.updateUserCarpoolListState(it.carpool1.owner!!, it.carpool1.carpoolId!!, carpoolListStatus)
//            carpoolListService.updateUserCarpoolListState(it.carpool2.owner!!, it.carpool2.carpoolId!!, carpoolListStatus)
//
//            if (it.carpool1.role.name!! == "Driver") {
//                val match = Match(
//                        it.carpool1.carpoolId!!,
//                        it.carpool2.carpoolId!!,
//                        false
//                )
//
//                matchRepository.save(match)
//            } else {
//                val match = Match(
//                        it.carpool2.carpoolId!!,
//                        it.carpool1.carpoolId!!,
//                        false
//                )
//
//                matchRepository.save(match)
//            }
//
//            val list = ArrayList<String>()
//            list.add(it.carpool1.owner!!)
//            list.add(it.carpool2.owner!!)
//            chatController.create(CreateChatDto(list))
//        }
//
//
//
//    }
}
//
fun calculateDistance(location1: Location, location2: Location): Double {
    val latDiff = location1.lat - location2.lat
    val lngDiff = location1.lng - location2.lng
    return sqrt(latDiff.pow(2) + lngDiff.pow(2))
}
//
fun isMatching(carpool1: CarpoolList, carpool2: CarpoolList): Boolean {
    val distanceThreshold = 0.1 // 임의의 거리 임계값 설정 (경험적으로 조정 필요)

    val startEnd1 = listOf(carpool1.boardingAddress, carpool1.destinationAddress)
    val startEnd2 = listOf(carpool2.boardingAddress, carpool2.destinationAddress)

    for (loc1 in startEnd1) {
        for (loc2 in startEnd2) {
            val distance = calculateDistance(loc1, loc2)
            if (distance < distanceThreshold) {
                return true
            }
        }
    }

    return false
}
//
fun matchCarpools(carpoolList: List<CarpoolList>): List<MatchedCarpoolList> {
    val matchedPairs = mutableListOf<MatchedCarpoolList>()

    val availableCarpoolList = ArrayList(carpoolList) // 중복 매칭 방지를 위한 복사본 생성

    for (i in 0 until carpoolList.size - 1) {
        for (j in i + 1 until carpoolList.size) {
            val carpool1 = carpoolList[i]
            val carpool2 = carpoolList[j]

            if (isMatching(carpool1, carpool2)) {
                matchedPairs.add(MatchedCarpoolList(carpool1, carpool2))
                // 이미 매칭된 카풀을 리스트에서 제거
                availableCarpoolList.remove(carpool1)
                availableCarpoolList.remove(carpool2)
                break // 이미 매칭되었기 때문에 다음 i에 대한 반복으로 이동
            }
        }
    }

    return matchedPairs
}

// 실행할 로직 작성
// 특정 시간에 실행되는 로직이 여기 들어갑니다.
// 그럼 대기열에 요청들을 담아놔야 하는데, 현재는 몽고디비에 존재하고 있음
// 미완료된 카풀 리스트를 전부 가져온다
// val unMatchedCarpoolList = carpoolListRepository.findByIsMatched(false)
// 여기서부터가 핵심 빠르고 신속하게 모든 카풀 리스트를 매칭시켜야 한다.
// 매번 위도 경도를 기반으로 거리를 구한다는 건 매우 비효율적
// 위도 경도를 기반으로 구역을 나눈다 (A, B, C, D, E, F, ...)
// 일단 서울만!
// 해시 테이블에 해당 구역과 인접한 구역들을 넣어놓는다.
// 그리고 인접단계에 따라 매칭!
// 우선순위
// 인접단계 1 > 인접단계2 > 인접단계 3
// 인접단계는 최대 3까지 3을 넘어가면 그냥 매칭을 패스함
// 같은 구역일 때는 닥치고 매칭! (근데 돌아가는 경로면 어떡하지?)
// 구역의 크기가 1KM * 1KM 니까 그정도는 돌아가도 괜찮지 않을까? (휴리스틱)
// 추후 방법을 생각 (우선순위 높지 않음)
// 구역은 1KM * 1KM 단위로 분할
//        unMatchedCarpoolList.map {
//            unMatchedCarpool ->
//            val latLng = S2LatLng.fromDegrees(unMatchedCarpool.boardingAddress.lat, unMatchedCarpool.boardingAddress.lng)
//            val cellId = S2CellId.fromLatLng(latLng)
//            val cellToken = cellId.toToken()
//
//            // 결과 출력
//            println("LatLng: $latLng")
//            println("S2CellId Token: $cellToken")
//        }
// 매칭 만족도는 100%가 목표가 아닌 70%가 목표
// 100, 100, 30, 30 보단
// 70, 70, 60, 60 지향