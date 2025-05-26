package com.quokka.server.web.socket
import org.springframework.stereotype.Service
import org.springframework.web.socket.*
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.ConcurrentHashMap

@Service
class LocationWebSocketHandler : TextWebSocketHandler() {
    private val sessions = ConcurrentHashMap<String, ArrayList<WebSocketSession>>() // TODO: db로 변경

    override fun afterConnectionEstablished(session: WebSocketSession) {
        // 쿼리 파라미터로 운전자의 userId를 보내줘야 한다. <-- 개선할 수 있는 점??
        println("LocationWebSocket Connection Ok")
        val uri = session.uri
        val sessionId = uri?.query?.split("=")?.get(1) ?: throw Exception()
        println("$sessionId")
        if (sessions[sessionId] == null) {
            sessions[sessionId] = ArrayList()
            sessions[sessionId]?.add(session)
        } else {
            sessions[sessionId]?.add(session)
        }
    }

    override fun handleMessage(session: WebSocketSession, message: WebSocketMessage<*>) {
        println("LocationWebSocket Connection Handle")
        val payload = message.payload.toString()

        val uri = session.uri
        val sessionId = uri?.query?.split("=")?.get(1) ?: throw Exception()

        sessions[sessionId]
                ?.forEach {
                    it.sendMessage(TextMessage(payload))
                }
    }

    override fun afterConnectionClosed(session: WebSocketSession, closeStatus: CloseStatus) {
        println("LocationWebSocket Connection Closed")
        val sessionId = getSessionIdBySession(session)
        sessions.remove(sessionId)
    }

    override fun supportsPartialMessages(): Boolean {
        return false
    }

    private fun getSessionIdBySession(session: WebSocketSession): String? {
        return sessions.entries.find { it.value == session }?.key
    }
}