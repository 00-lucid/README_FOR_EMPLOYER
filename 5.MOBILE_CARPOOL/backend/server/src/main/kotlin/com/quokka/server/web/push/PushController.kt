package com.quokka.server.web.push

import com.quokka.server.domain.push.PushService
import com.quokka.server.web.push.dto.FcmTokenDto
import com.quokka.server.web.push.dto.PushTestDto
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.web.bind.annotation.*

@Api(tags = ["푸시 관련"], description = "FCM 토큰 생성/제거")
@RestController
@RequestMapping("/push")
class PushController(private val pushService: PushService) {

    @ApiOperation(value = "create fcmToken", notes = "FCM 토큰 생성")
    @PostMapping("/fcm-token")
    fun createFcmToken(@RequestBody fcmTokenDto: FcmTokenDto) {
        return pushService.createFcmToken(fcmTokenDto.fcmToken, fcmTokenDto.userId)
    }

    @ApiOperation(value = "delete fcmToken", notes = "FCM 토큰 제거")
    @DeleteMapping("/fcm-token")
    fun deleteFcmToken(@RequestBody fcmTokenDto: FcmTokenDto) {
        return pushService.deleteFcmToken(fcmTokenDto.fcmToken, fcmTokenDto.userId)
    }

    @ApiOperation(value = "send Push", notes = "[테스트용] 푸시 보내기")
    @PostMapping()
    fun push(@RequestBody pushTestDto: PushTestDto) {
        return pushService.push(pushTestDto.fcmTokens, pushTestDto.data)
    }

}
