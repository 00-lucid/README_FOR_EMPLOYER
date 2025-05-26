package com.quokka.server.web.chat

import com.quokka.server.domain.chat.ChatService
import com.quokka.server.web.auth.AuthService
import com.quokka.server.web.chat.dto.ChatDetailDto
import com.quokka.server.web.chat.dto.ChatDto
import io.swagger.annotations.Api
import io.swagger.annotations.ApiOperation
import io.swagger.annotations.ApiParam
import org.bson.types.ObjectId
import org.springframework.web.bind.annotation.*

@Api(tags = ["채팅"], description = "채팅 API")
@RestController
@RequestMapping("/chats")
class ChatController (
        private val chatService: ChatService,
        private val authService: AuthService
        ) {

    @PostMapping()
    fun create(@RequestBody createChat: CreateChatDto) {
        chatService.create(createChat.userIds, carpoolId = Math.random().toInt())
    }

    @ApiOperation(value = "getChatById", notes = "채팅 조회")
    @GetMapping("/{chatId}")
    fun get(@PathVariable chatId: String, @RequestHeader("Authorization") @ApiParam("Bearer AccessToken") authorizationHeader: String): ChatDetailDto? {
        val accessToken = authorizationHeader.replace("Bearer", "").trim()
        val userId = authService.verifyToken(accessToken)
        val objectChatId = ObjectId(chatId)
        return chatService.getById(objectChatId, userId)
    }

    @ApiOperation(value = "getChatByUserId", notes = "유저의 채팅리스트 조회")
    @GetMapping()
    fun getByUserId(@RequestParam userId: String): List<ChatDto>? {
        return chatService.getByUserId(userId)
    }

//    // 채팅 나가기
//    @PostMapping("/{chatId}/exit")
//    fun exit(@PathVariable chatId: String, @RequestParam userId: String) {
//        chatService.exit(chatId, userId)
//    }
}

class CreateChatDto (
        var userIds: List<String>
        )


