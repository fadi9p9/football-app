// src/notification/notification.controller.ts
import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notifService: NotificationService) {}

  @Get()
  getMyNotifications(@Request() req) {
    return this.notifService.getUserNotifications(req.user.id);
  }

  @Patch('read/:id')
  markOneAsRead(@Param('id') id: number) {
    return this.notifService.markAsRead(id);
  }

  @Patch('read-all')
  markAllAsRead(@Request() req) {
    return this.notifService.markAllAsRead(req.user.id);
  }
}
