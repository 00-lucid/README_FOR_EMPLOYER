import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway()
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {

    private logger: Logger = new Logger('MessageGateway');

    @WebSocketServer() wss: Server;

    afterInit(server: Server){
        this.logger.log('Hello Socket!');
    }

    handleConnection(client: Socket){
        // this.logger.log(`Client connected: ${client.id}`)
    }

    handleDisconnect(client: Socket){
        // this.logger.log(`Client disconnected: ${client.id}`)
    }

    // toServer -> onChat -> toClient
    @SubscribeMessage('messageToServer')
    onChat(client: Socket, message: string): void{
        console.log('receive');
        console.log(message); 
        // return { event: 'messageToClient', data: message}
        this.wss.emit('messageToClient', message);
    }

}
