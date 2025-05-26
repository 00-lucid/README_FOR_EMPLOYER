package com.quokka.server.domain.push

import com.google.firebase.messaging.FirebaseMessaging
import com.google.firebase.messaging.MulticastMessage
import com.google.firebase.messaging.Notification
import com.quokka.server.domain.user.UserRepository
import com.quokka.server.web.push.dto.PushChatData
import com.quokka.server.web.push.dto.PushData
import org.springframework.data.crossstore.ChangeSetPersister
import org.springframework.stereotype.Service


@Service
class PushService(private val userRepository: UserRepository) {
    fun createFcmToken(token: String, userId: String) {
        val user = userRepository.findByUserId(userId) ?: throw ChangeSetPersister.NotFoundException()
        user.fcmToken = token
        userRepository.save(user)
    }

    fun deleteFcmToken(token: String, userId: String) {
        val user = userRepository.findByUserId(userId) ?: throw ChangeSetPersister.NotFoundException()
        user.fcmToken = ""
        userRepository.save(user)
    }

    fun push(fcmTokens: List<String>, data: PushData) {
        val message = MulticastMessage.builder()
                .setNotification(
                        Notification
                        .builder()
                        .setTitle(data.title)
                        .setBody(data.message)
                        .build())
//                .putData("chatId", data.title)
//                .putData("message", data.message)
                .addAllTokens(fcmTokens)
                .build()
        val response = FirebaseMessaging.getInstance().sendEachForMulticast(message)
        println("Successfully sent message: $response")
    }

    fun pushChat(fcmTokens: List<String>, data: PushChatData) {
        val message = MulticastMessage.builder()
                .setNotification(
                        Notification
                                .builder()
                                .setTitle(data.title)
                                .setBody(data.message)
                                .build())
                .putData("chatId", data.chatId)
                .addAllTokens(fcmTokens)
                .build()
        val response = FirebaseMessaging.getInstance().sendEachForMulticast(message)
        println("Successfully sent message: $response")
    }

}