import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

 private onlineUsers = new Map<number, string>();

  constructor(private readonly chatService: ChatService) {}

 handleConnection(socket: Socket) {
  const userId = Number(socket.handshake.query.userId);
  if (userId) {
    this.onlineUsers.set(userId, socket.id);
  }
}


 @SubscribeMessage('send_message')
async handleSendMessage(
  @MessageBody() data: { senderId: number; receiverId: number; content: string },
) {
  const message = await this.chatService.sendMessage(
    data.senderId,
    data.receiverId,
    data.content,
  );

  const receiverSocketId = this.onlineUsers.get(data.receiverId);
  if (receiverSocketId) {
    this.server.to(receiverSocketId).emit('receive_message', message);
    this.server.to(receiverSocketId).emit('new_notification', {
      fromUserId: data.senderId,
      message: data.content,
       time: message.createdAt,
    });
  }
  return message;
}


  @SubscribeMessage('mark_read')
async handleMarkRead(
  @MessageBody() data: { senderId: number; receiverId: number },
) {
  await this.chatService.markMessagesRead(data.senderId, data.receiverId);
}

}
