import { Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

//   @Get(':userId')
//   getConversation(@Param('userId') userId: number, @Request() req) {
//     return this.chatService.getConversation(req.user.userId, userId);
//   }

  @Get('contacts')
getContacts(@Request() req) {
  return this.chatService.getContacts(req.user.userId);
}
@Get('conversation/:user1/:user2')
async getConversation(@Param('user1') u1: number, @Param('user2') u2: number) {
  return this.chatService.getConversation(u1, u2);
}


  @Patch('read/:senderId')
async markAsRead(
  @Param('senderId') senderId: number,
  @Request() req
) {
  return this.chatService.markMessagesRead(senderId, req.user.userId);
}
}
