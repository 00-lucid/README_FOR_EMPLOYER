package com.quokka.server.web.etc

import com.quokka.server.domain.etc.EtcService
import com.quokka.server.web.etc.dto.RecommendationCodeDto
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import org.springframework.web.bind.annotation.*

@Api(tags = ["ETC"], description = "기타 (추천코드...)")
@RestController
@RequestMapping("/etc")
class EtcController(private val etcService: EtcService) {

    @ApiOperation(value = "recommendationCode", notes = "추천코드 확인")
    @PostMapping("/recommendationCode")
    fun verifyRecommendationCode(@RequestBody body: RecommendationCodeDto): Boolean {
        return etcService.verifyRecommendationCode(body.code)
    }

}
