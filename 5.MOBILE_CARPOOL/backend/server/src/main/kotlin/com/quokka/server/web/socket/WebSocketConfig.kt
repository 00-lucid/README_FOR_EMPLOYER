package com.quokka.server.web.socket

import org.springframework.context.annotation.Configuration
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry

@Configuration
@EnableWebSocket
class WebSocketConfig(
        private val chatWebSocketHandler: ChatWebSocketHandler, // 생성자 주입
        private val locationWebSocketHandler: LocationWebSocketHandler
) : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(chatWebSocketHandler, "/chat-socket").setAllowedOrigins("*")
        registry.addHandler(locationWebSocketHandler, "/location-socket").setAllowedOrigins("*")
    }
}