import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamPost } from './team-post.entity';
import { Repository, ILike } from 'typeorm';
import { CreateTeamPostDto, UpdateTeamPostDto } from './dto/create-team-post.dto';
import { User } from '../user/user.entity';
import { existsSync, unlinkSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class TeamPostService {
  constructor(
    @InjectRepository(TeamPost)
    private readonly postRepo: Repository<TeamPost>,
  ) {}

 async createPost(
  createPostDto: CreateTeamPostDto,
  user: { userId: number; email: string } // تم تعديل نوع المعلمة ليتطابق مع ما تعيده دالة validate
): Promise<TeamPost> {
  try {
    const post = this.postRepo.create({
      ...createPostDto,
      user: { id: user.userId } // استخدمنا user.userId هنا
    });

    const savedPost = await this.postRepo.save(post);
    return savedPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw new InternalServerErrorException('Failed to create post');
  }
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
      select:{
          id:true,
          title:true,
          location:true,
          date:true,
          time:true,
          duration:true,
          missingPlayers:true,
          description:true,
          phone:true,
          createdAt:true,
          image:true,
          user:{
            id:true,
            name:true,
            email:true,
            avatar:true,
          }
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const post = await this.postRepo.findOne({ 
      where: { id }, 
      relations: ['user'] ,
      select:{
          id:true,
          title:true,
          location:true,
          date:true,
          time:true,
          duration:true,
          missingPlayers:true,
          description:true,
          phone:true,
          createdAt:true,
          image:true,
          user:{
            id:true,
            name:true,
            email:true,
            avatar:true,
          }
      },
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async updateImage(id: number, imagePath: string, userId: number) {
    const post = await this.postRepo.findOne({
      where: { id, user: { id: userId } },
      relations: ['user']
    });

    if (!post) {
      throw new NotFoundException('Post not found or you are not the owner');
    }

    if (post.image && existsSync(`.${post.image}`)) {
      try {
        unlinkSync(`.${post.image}`);
      } catch (err) {
        console.error('Failed to delete old image:', err);
      }
    }

    post.image = imagePath;
    return await this.postRepo.save(post);
  }

  async remove(id: number, userId: number) {
    const post = await this.findOne(id);
    if (post.user.id !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (post.image && existsSync(`.${post.image}`)) {
      try {
        unlinkSync(`.${post.image}`);
      } catch (err) {
        console.error('Failed to delete post image:', err);
      }
    }

    await this.postRepo.remove(post);
    return { message: 'Post deleted successfully' };
  }

 async updatePost(
  postId: number,
  updatePostDto: UpdateTeamPostDto,
  userId: number
): Promise<TeamPost> {
  const queryRunner = this.postRepo.manager.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const post = await this.postRepo.findOne({
      where: { id: postId, user: { id: userId } },
      relations: ['user']
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // حذف الصورة القديمة إذا تم تحديثها
    if (updatePostDto.image && post.image && updatePostDto.image !== post.image) {
      await this.deleteImage(post.image);
    }

    const updatedPost = this.postRepo.merge(post, updatePostDto);
    const savedPost = await queryRunner.manager.save(updatedPost);
    await queryRunner.commitTransaction();
    return savedPost;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Error updating post:', error);
    throw new InternalServerErrorException('Failed to update post');
  } finally {
    await queryRunner.release();
  }
}

private async deleteImage(imagePath: string) {
  const fullPath = join(process.cwd(), imagePath);
  if (existsSync(fullPath)) {
    try {
      unlinkSync(fullPath);
    } catch (err) {
      console.error('Failed to delete image:', err);
    }
  }
}

 private async saveImageToDisk(file: Express.Multer.File): Promise<string> {
  const fs = require('fs');
  const path = require('path');
  
  // استبدال الفراغات بشرطات في اسم الملف
  const safeFilename = file.originalname.replace(/\s+/g, '-');
  const filename = `${Date.now()}-${safeFilename}`;
  const uploadDir = path.join(process.cwd(), 'uploads', 'team-posts');
  const filePath = path.join(uploadDir, filename);

  try {
    await fs.promises.mkdir(uploadDir, { recursive: true });
    await fs.promises.writeFile(filePath, file.buffer);
    return `/uploads/team-posts/${filename}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new InternalServerErrorException('Failed to save image');
  }
}
}