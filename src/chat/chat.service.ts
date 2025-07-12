import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
  import { In } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly msgRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async sendMessage(senderId: number, receiverId: number, content: string) {
    const sender = await this.userRepo.findOne({ where: { id: senderId } });
    const receiver = await this.userRepo.findOne({ where: { id: receiverId } });
if (!sender || !receiver) {
  throw new Error('Sender or Receiver not found');
}
    const message = this.msgRepo.create({
      sender,
      receiver,
      content,
    });

    return await this.msgRepo.save(message);
  }

  async getConversation(userId1: number, userId2: number) {
  return this.msgRepo.find({
    where: [
      { sender: { id: userId1 }, receiver: { id: userId2 } },
      { sender: { id: userId2 }, receiver: { id: userId1 } },
    ],
    order: { createdAt: 'ASC' },
  });
}



async getContacts(userId: number) {
  // جلب كل المستخدمين الذين تحدث معهم المستخدم الحالي (مرسل أو مستقبل)
  const sentUsers = await this.msgRepo
    .createQueryBuilder('message')
    .select('DISTINCT message.receiverId', 'userId')
    .where('message.senderId = :userId', { userId })
    .getRawMany();

  const receivedUsers = await this.msgRepo
    .createQueryBuilder('message')
    .select('DISTINCT message.senderId', 'userId')
    .where('message.receiverId = :userId', { userId })
    .getRawMany();

  const userIds = Array.from(
    new Set([...sentUsers.map(u => u.userId), ...receivedUsers.map(u => u.userId)]),
  );

  return this.userRepo.find({
    where: { id: In(userIds) },
    select: ['id', 'name', 'email', 'avatar'] 
  });
}
async markMessagesRead(senderId: number, receiverId: number) {
  await this.msgRepo
    .createQueryBuilder()
    .update(Message)
    .set({ isRead: true })
    .where('senderId = :senderId', { senderId })
    .andWhere('receiverId = :receiverId', { receiverId })
    .andWhere('isRead = false')
    .execute();
}

}
