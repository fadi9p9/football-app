import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamPost } from './team-post.entity';
import { Repository, ILike } from 'typeorm';
import { CreateTeamPostDto } from './dto/create-team-post.dto';
import { User } from '../user/user.entity';
import { existsSync, unlinkSync } from 'fs';

@Injectable()
export class TeamPostService {
  constructor(
    @InjectRepository(TeamPost)
    private readonly postRepo: Repository<TeamPost>,
  ) {}

  async create(dto: CreateTeamPostDto, user: User) {
    const { image, ...rest } = dto;
const post = this.postRepo.create({
  ...rest,
  image: image ?? undefined, 
  user,
});
    return await this.postRepo.save(post);
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
    locationFilter?: string,
    dateFilter?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    if (locationFilter) {
      where.location = ILike(`%${locationFilter}%`);
    }

    if (dateFilter) {
      where.date = dateFilter;
    }

    const [items, total] = await this.postRepo.findAndCount({
      where,
      relations: ['user'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: items,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findMine(userId: number) {
    return this.postRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const post = await this.postRepo.findOne({ where: { id }, relations: ['user'] });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: number, dto: Partial<CreateTeamPostDto>, userId: number) {
  const post = await this.findOne(id);
  if (post.user.id !== userId) throw new ForbiddenException('Access denied');

  // حذف الصورة القديمة إذا تم تمرير صورة جديدة
  if (dto.image && post.image && existsSync(`.${post.image}`)) {
    unlinkSync(`.${post.image}`);
  }

  Object.assign(post, dto);
  return await this.postRepo.save(post);
}

  async remove(id: number, userId: number) {
    const post = await this.findOne(id);
    if (post.user.id !== userId) throw new ForbiddenException('Access denied');

    await this.postRepo.remove(post);
    return { message: 'Post deleted successfully' };
  }
}
