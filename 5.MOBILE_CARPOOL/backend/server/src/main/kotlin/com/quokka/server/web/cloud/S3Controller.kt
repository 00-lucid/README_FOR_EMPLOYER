package com.quokka.server.web.cloud

import com.quokka.server.domain.cloud.S3Service
import io.swagger.annotations.Api
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@Api(tags = ["S3"], description = "S3 파일 업로드/다운로드")
@RestController
@RequestMapping("/s3")
class S3Controller (
        private val s3Service: S3Service
        ) {

    @PostMapping("/upload")
    fun fileUpload(@ModelAttribute multipartFiles: List<MultipartFile> = ArrayList()): List<String> {
        return s3Service.uploadFiles(multipartFiles)
    }

}