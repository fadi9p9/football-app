import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './typeorm.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { TeamPostModule } from './team-post/team-post.module';
import { ChatModule } from './chat/chat.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), UserModule, AuthModule, TeamPostModule, ChatModule, NotificationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
