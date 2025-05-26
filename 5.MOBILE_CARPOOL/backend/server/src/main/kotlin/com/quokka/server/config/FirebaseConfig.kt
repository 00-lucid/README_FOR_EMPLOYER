package com.quokka.server.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.messaging.FirebaseMessaging
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.FileInputStream

@Configuration
class FirebaseConfig {

    @Bean
    fun firebaseMessaging(): FirebaseMessaging {
        val options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(FileInputStream("quokka-app-2c055-firebase-adminsdk-oszyo-4a6f0ed21a.json")))
                .build()

        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options)
        }

        return FirebaseMessaging.getInstance()
    }
}