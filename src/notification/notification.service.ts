// src/notification/notification.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { User } from '../user/user.entity';
import { NotificationGateway } from './notification.gateway';
@Injectable()
export class NotificationService {
  
  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private notificationGateway: NotificationGateway
  ) {}

  async createNotification(userId: number, content: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const notif = this.notifRepo.create({ user, content });
    const savedNotif = await this.notifRepo.save(notif);
    
    this.notificationGateway.sendNotification(userId, content);
    
    return savedNotif;
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
