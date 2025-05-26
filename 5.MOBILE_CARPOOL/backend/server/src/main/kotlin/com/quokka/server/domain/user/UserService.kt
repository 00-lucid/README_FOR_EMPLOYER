package com.quokka.server.domain.user

import com.quokka.server.domain.cloud.S3Service
import com.quokka.server.domain.passenger.ProfileImage
import com.quokka.server.web.user.dto.SocialJoinData
import com.quokka.server.web.user.dto.UserInfoDto
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.query.Criteria
import org.springframework.data.mongodb.core.query.Query
import org.springframework.data.mongodb.core.query.Update
import org.springframework.data.mongodb.core.updateFirst
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.ModelAttribute
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDateTime

// todo: 예외 처리
@Service
class UserService(
        private val userRepository: UserRepository,
        private val s3Service: S3Service,
        val mongoTemplate: MongoTemplate
) {
    fun update(userId: String, uuid: String, socialLoginData: SocialLoginData) {
        val user = userRepository.findByUserId(userId) ?: throw NotFoundException()
        user.socialLoginData = socialLoginData
        user.uuid = uuid
        userRepository.save(user)
    }

    fun socialJoin(userId: String, socialJoinData: SocialJoinData): String {
        val user = userRepository.findByUserId(userId) ?: throw NotFoundException()
        try {
            println("aaaa")
            user.userData = UserData(
                    username = socialJoinData.username,
                    profileImage = s3Service.getFileRocation(socialJoinData.profileImage),
                    phone = socialJoinData.phone,
            )
            println("user = ${user}")
            user.carData = CarData(
                    number = socialJoinData.carNumber,
                    type = socialJoinData.carType,
                    isWheelchair = socialJoinData.carWheelchair,
            )
            user.moreInfo = MoreInfo(
                    needGuardian = socialJoinData.needGuardian,
                    guardianPhone = socialJoinData.guardianPhone,
                    needWheelchair = socialJoinData.needWheelchair,
                    etcInfo = socialJoinData.etcInfo,
            )
            user.termsChecked = socialJoinData.termsChecked
            user.createdAt = LocalDateTime.now()
            user.updatedAt = LocalDateTime.now()

            userRepository.save(user)
        } catch (error: Error) {
            println("error = $error")
        }

        return "Ok"
    }

    fun getUser(userId: String, accessToken: String): UserInfoDto {
        val user = userRepository.findByUserId(userId) ?: throw IllegalStateException("유저를 찾을 수 없음")
        return UserInfoDto(
                userData = UserInfoDto.UserData(
                        userId = user.userId,
                        username = user.userData?.username,
                        phone = user.userData?.phone,
                        profileImage = user.userData?.profileImage?.let {
                            if (it.isEmpty()) {
                                return@let ""
                            }
                            s3Service.generatePresignedUrl(it)
                        }
                ),
                carData = UserInfoDto.CarData(
                        carNumber = user.carData?.number,
                        carType = user.carData?.type,
                        carWheelchair = user.carData?.isWheelchair
                ),
                socialLoginData = UserInfoDto.SocialLoginData(
                        provider = user.socialLoginData?.provider,
                        accessToken = user.socialLoginData?.accessToken
                ),
                passengerInfo = UserInfoDto.PassengerInfo(
                        needGuardian = user.moreInfo?.needGuardian,
                        guardianPhone = user.moreInfo?.guardianPhone,
                        needWheelchair = user.moreInfo?.needWheelchair,
                        etcInfo = user.moreInfo?.etcInfo,
                ),
                termsChecked = true,
//                createdAt = user.createdAt,
//                updatedAt = user.updatedAt
        )

    }

    fun updateUserName(userId: String, username: String): String {
        val user = userRepository.findByUserId(userId) ?: throw IllegalStateException("유저를 찾을 수 없음")
        val query = Query(Criteria.where("_id").`is`(user.id))
        val update = Update().set("user_data.username", username)
        val result = mongoTemplate.updateFirst(query, update, "users")

        return username
    }

    fun updateProfileImage(userId: String, fileUrl: String): String {
        // TODO 기존 프로필 이미지 삭제 (비용 절감 목적)
        val user = userRepository.findByUserId(userId) ?: throw IllegalStateException("유저를 찾을 수 없음")
        val query = Query(Criteria.where("_id").`is`(user.id))
        val url = s3Service.getFileRocation(fileUrl)
        val update = Update().set("user_data.profile_image", url)
        mongoTemplate.updateFirst(query, update, User::class.java)

//        return s3Service.getFileRocation(profileImage)
        return url
    }

    fun deleteUser(userId: String) {
        val user = userRepository.findByUserId(userId) ?: throw IllegalStateException("유저를 찾을 수 없음")
        val query = Query(Criteria.where("_id").`is`(user.id))
        mongoTemplate.remove(query, "users")
    }
}

