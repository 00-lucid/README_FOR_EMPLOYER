package com.quokka.server.web.carpool

import com.quokka.server.web.match.MatchService
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Api(tags = ["카풀 API"], description = "쿼카 프로젝트 카풀 API")
@RequestMapping("/carpool")
@RestController
class CarpoolListController(
        private val carpoolListService: CarpoolListService,
        private val matchService: MatchService
) {
    @ApiOperation(value = "getCompleteUserCarpoolList", notes = "유저 완료 카풀 리스트 조회")
    @GetMapping("/complete/list/{userId}")
    fun getCompleteCarpoolList(@PathVariable userId: String, @RequestParam page: Int): List<CarpoolListResponse> {
        val list = carpoolListService.findCompleteUserCarpoolList(userId, page).sortedByDescending {
            it.carpoolId
        }

        val result = ArrayList<CarpoolListResponse>()

        for (data in list) {
            val isDone = isDateTimeBeforeNow(data.time)
            if (isDone) {
                // TODO 완료된 카풀이 정상적으로 완료됐는지 확인
//                val match = matchService.findCompleteMatchByCarpoolId(data.carpoolId!!) ?: error("Cannot get Match by carpoolId.")
//                if (data.carpoolStatus != Status.COMPLETED || !match.end) {
//                    continue
//                }

                val date = data.time.split(" ")[0]
                // TODO getCarpoolList를 매번하는 것은 비효율적이기 때문에 해시 테이블로 전환 필요
                val carpoolList = getCarpoolListResponseByDate(result, date)
                if (carpoolList == null) {
                    result.add(CarpoolListResponse(date = date, carpools = listOf(data)))
                } else {
                    carpoolList.carpools = carpoolList.carpools + listOf(data)
                }
            }
        }

        return result
    }

    @ApiOperation(value = "getInCompleteUserCarpoolList", notes = "유저 미완료 카풀 리스트 조회")
    @GetMapping("/incomplete/list/{userId}")
    fun getInCompleteCarpoolList(@PathVariable userId: String, @RequestParam page: Int): List<CarpoolListResponse> {
        // TODO 매칭된 카풀 중 취소된 카풀은 보내면 안된다
        val list = carpoolListService.findInCompleteUserCarpoolList(userId, page).sortedByDescending {
            it.carpoolId
        }

        val result = ArrayList<CarpoolListResponse>()

        for (data in list) {
            val isDone = isDateTimeBeforeNow(data.time)
            if (!isDone) {
                // TODO 해당 카풀이 매칭됐는지 확인 -> 됐으면 취소됐는지 확인 -> 됐으면 리스트에 포함하지 않음
//                val match = matchService.findCompleteMatchByCarpoolId(data.carpoolId!!) ?: error("Cannot get Match by carpoolId.")
//                if (null != match) {
//                    if (data.carpoolStatus == Status.CANCELLED) {
//                        continue
//                    }
//                }

                val date = data.time.split(" ")[0]
                // TODO getCarpoolList를 매번하는 것은 비효율적이기 때문에 해시 테이블로 전환 필요
                val carpoolList = getCarpoolListResponseByDate(result, date)
                if (carpoolList == null) {
                    result.add(CarpoolListResponse(date = date, carpools = listOf(data)))
                } else {
                    carpoolList.carpools = carpoolList.carpools + listOf(data)
                }
            }
        }

        return result
    }

    @ApiOperation(value = "addUserCarpoolList", notes = "유저 카풀 리스트 생성")
    @PostMapping("/list/{userId}")
    fun createUserCarpoolList(@PathVariable userId: String, @RequestBody carpoolListRequest: CarpoolListRequest): CarpoolList {
        return carpoolListService.addUserCarpoolList(userId, carpoolListRequest)
    }

    @ApiOperation(value = "adjustUserCarpoolListState", notes = "유저 카풀 리스트 상태 수정")
    @PatchMapping("/list/{userId}/{carpoolId}")
    fun adjustUserCarpoolList(@PathVariable userId: String, @PathVariable carpoolId: Int, @RequestBody carpoolListStatus: CarpoolListStatusRequest): CarpoolList {
        return carpoolListService.updateUserCarpoolListState(userId, carpoolId, carpoolListStatus)
//        return carpoolListService.editUserCarpoolListState(userId, carpoolId, carpoolListStatus)
    }

    @ApiOperation(value = "deleteUserCarpoolList", notes = "유저 카풀 리스트 삭제")
    @DeleteMapping("/list/{userId}/{carpoolId}")
    fun deleteUserCarpoolList(@PathVariable userId: String, @PathVariable carpoolId: Int): CarpoolList {
        return carpoolListService.removeUserCarpoolList(userId, carpoolId)
    }

    @ApiOperation(value = "getUserCarpoolListDetail", notes = "유저 카풀 리스트 상세 조회")
    @GetMapping("/list/{userId}/{carpoolId}")
    fun getUserCarpoolListDetail(@PathVariable userId: String, @PathVariable carpoolId: Int): CarpoolListDetail {
        return carpoolListService.findUserCarpoolListDetail(userId, carpoolId)
    }

    @ApiOperation(value = "initCarpoolList", notes = "유저 카풀 시작")
    @GetMapping("/list/{userId}/{carpoolId}/init")
    fun initCarpoolList(@PathVariable userId: String, @PathVariable carpoolId: Int): CarpoolList {
        val status = CarpoolListStatusRequest(
                Status.DRIVING
        )

        return carpoolListService.updateUserCarpoolListState(userId, carpoolId, status)
    }

    @ApiOperation(value = "exitCarpoolList", notes = "유저 카풀 종료")
    @GetMapping("/list/{userId}/{carpoolId}/exit")
    fun exitCarpoolList(@PathVariable userId: String, @PathVariable carpoolId: Int): CarpoolList {
        // TODO 종료 시 Match 데이터의 end 값을 true로, Carpool 데이터의 carpoolStatus 값을 COMPLETED로 바꾼다.
        val status = CarpoolListStatusRequest(
                Status.COMPLETED
        )

        return carpoolListService.updateUserCarpoolListState(userId, carpoolId, status)
    }
}

fun getCarpoolListResponseByDate(
        list: ArrayList<CarpoolListResponse>,
        targetDate: String
): CarpoolListResponse? {
    for (response in list) {
        if (response.date == targetDate) {
            return response
        }
    }
    return null
}

fun isDateTimeBeforeNow(dateTimeStr: String): Boolean {
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")
    val dateTime = LocalDateTime.parse(dateTimeStr, formatter)
    val now = LocalDateTime.now()
    return dateTime.isBefore(now)
}