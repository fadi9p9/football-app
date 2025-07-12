// src/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../user/user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createNotification(userId: number, content: string) {
  const user = await this.userRepo.findOne({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const notif = this.notifRepo.create({ user, content });
  return this.notifRepo.save(notif);
}


  async getUserNotifications(userId: number) {
    return this.notifRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(notificationId: number) {
    return this.notifRepo.update(notificationId, { isRead: true });
  }

  async markAllAsRead(userId: number) {
    return this.notifRepo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('userId = :userId AND isRead = false', { userId })
      .execute();
  }
}
