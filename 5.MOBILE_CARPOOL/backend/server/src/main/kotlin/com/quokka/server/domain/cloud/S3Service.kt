package com.quokka.server.domain.cloud

import com.amazonaws.SdkClientException
import com.amazonaws.services.s3.AmazonS3
import com.amazonaws.services.s3.model.ObjectMetadata
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.net.URI
import java.util.*


@Service
class S3Service(private val s3Client: AmazonS3) {
    @Value("\${cloud.aws.s3.bucket}")
    lateinit var bucket: String

    @Value("\${cloud.aws.s3.dir}")
    lateinit var dir: String

    @Throws(IOException::class)
    fun uploadFiles(files: List<MultipartFile>): List<String> {
        return files.map { uploadFile(it) }.toMutableList()
    }

    @Throws(IOException::class)
    fun uploadFile(file: MultipartFile): String {
        val originalFilename = file.originalFilename.toString()
        val storeFileName = createStoreFileName(originalFilename)
        try {
            s3Client.putObject(bucket, dir + storeFileName, file.inputStream, getObjectMetadata(file))
            return generatePresignedUrl(dir + storeFileName)
        } catch (e: SdkClientException) {
            throw IOException("Error uploading file to S3", e)
        }
    }

    fun generatePresignedUrl(fileLocation: String): String {
        val expiration = Date(System.currentTimeMillis() + 1200 * 1000) // 20분
        return s3Client.generatePresignedUrl(bucket, fileLocation, expiration).toString()
    }

    fun getFileRocation(uriString: String?): String {
        if (uriString == null) {
            return ""
        }
        val uri = URI(uriString)
        return uri.path.substringAfter("/")
    }

    private fun getObjectMetadata(file: MultipartFile): ObjectMetadata {
        val objectMetadata = ObjectMetadata()
        objectMetadata.contentType = file.contentType
        objectMetadata.contentLength = file.size
        return objectMetadata
    }

    private fun createStoreFileName(originalFilename: String): String {
        val ext = extractExt(originalFilename)
        val uuid = UUID.randomUUID().toString()
        return "$uuid.$ext"
    }

    private fun extractExt(originalFilename: String): String {
        val index = originalFilename.lastIndexOf(".")
        return originalFilename.substring(index + 1)
    }

}