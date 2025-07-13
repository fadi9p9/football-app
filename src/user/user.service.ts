import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { User } from "./user.entity";
import { CreateUserDto } from "src/auth/dto/create-user.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { TeamPost } from "src/team-post/team-post.entity";
import { Message } from "src/chat/message.entity";
import { Notification } from '../notification/entities/notification.entity';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  create(dto: CreateUserDto) {
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  findAll() {
    return this.userRepo.find();
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async update(id: number, dto: Partial<User>, requesterId: number) {
    if (id !== requesterId) {
      throw new ForbiddenException('Unauthorized update attempt');
    }
    await this.userRepo.update(id, dto);
    return this.userRepo.findOne({ where: { id } });
  }

  async remove(id: number) {
  const queryRunner = this.userRepo.manager.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    await queryRunner.manager.delete(Message, { sender: { id } });
    await queryRunner.manager.delete(Message, { receiver: { id } });

    if (Notification) {
      await queryRunner.manager.delete(Notification, { user: { id } });
    }

    await queryRunner.manager.delete(TeamPost, { user: { id } });

    await queryRunner.manager.delete(User, id);

    await queryRunner.commitTransaction();
    return { message: 'User deleted successfully' };
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error deleting user:', error);
    throw new InternalServerErrorException('Failed to delete user');
  } finally {
    await queryRunner.release();
  }
}
}
