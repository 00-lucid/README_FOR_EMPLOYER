package com.quokka.server.web.message

import com.quokka.server.domain.message.Message
import com.quokka.server.domain.message.MessageService
import com.quokka.server.web.message.dto.CreateMessageDto
import com.quokka.server.web.message.dto.MessageListDto
import io.swagger.annotations.Api
import org.bson.types.ObjectId
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.web.bind.annotation.*

@Api(tags = ["메세지"], description = "메세지 API")
@RestController
@RequestMapping("/messages")
class MessageController(private val messageService: MessageService) {

    @PostMapping()
    fun create(@RequestBody createMessageDto: CreateMessageDto): String {
        return messageService.create(createMessageDto)
    }

    @GetMapping()
    fun getMessages(@RequestParam chatId: String,
                    @RequestParam(required = false) lastId: String?,
                    @RequestParam(defaultValue = "10") limit: Int): List<MessageListDto> {
        val objectChatId = ObjectId(chatId)
        val objectLastId = lastId?.let { ObjectId(it) }
        val pageable = PageRequest.of(0, limit)
        return messageService.findMessagesByChatIdBeforeId(objectChatId, objectLastId, pageable)
    }

//    @DeleteMapping("/{messageId}")
//    fun delete(@PathVariable chatId: String) {
//        return messageService.deleteOne(chatId)
//    }
}