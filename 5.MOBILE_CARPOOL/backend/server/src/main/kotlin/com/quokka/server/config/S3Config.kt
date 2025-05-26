package com.quokka.server.config

import com.amazonaws.auth.AWSStaticCredentialsProvider
import com.amazonaws.auth.BasicAWSCredentials
import com.amazonaws.services.s3.AmazonS3Client
import com.amazonaws.services.s3.AmazonS3ClientBuilder
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary

@Configuration
class S3Config {
    @Value("\${cloud.aws.credentials.accessKey}")
    lateinit var iamAccessKey: String

    @Value("\${cloud.aws.credentials.secretKey}")
    lateinit var iamSecretKey: String

    @Value("\${cloud.aws.region.static}")
    lateinit var region: String

    @Bean
    @Primary
    fun amazonS3Client(): AmazonS3Client {
        val basicAWSCredentials = BasicAWSCredentials(iamAccessKey, iamSecretKey)
        return AmazonS3ClientBuilder.standard()
                .withRegion(region)
                .withCredentials(AWSStaticCredentialsProvider(basicAWSCredentials))
                .build() as AmazonS3Client
    }
}