import { ForbiddenException, Injectable } from "@nestjs/common";
import { User } from "./user.entity";
import { CreateUserDto } from "src/auth/dto/create-user.dto";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

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

  findOne(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async update(id: number, dto: Partial<User>, requesterId: number) {
    if (id !== requesterId) {
      throw new ForbiddenException('Unauthorized update attempt');
    }
    await this.userRepo.update(id, dto);
    return this.userRepo.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.userRepo.delete(id);
    return { message: 'User deleted successfully' };
  }
}
