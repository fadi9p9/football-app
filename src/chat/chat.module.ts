import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { Message } from './message.entity';
import { User } from '../user/user.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User]),NotificationModule,UserModule],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway,],
  exports: [ChatService],
})
export class ChatModule {}
