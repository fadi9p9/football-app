import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  Request,
  UseGuards,
  Patch,
  Param,
  ParseIntPipe,
  Get,
  Query,
  Delete,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TeamPostService } from './team-post.service';
import { CreateTeamPostDto, UpdateTeamPostDto } from './dto/create-team-post.dto';
import { AuthGuard } from '@nestjs/passport';
import { ImageUploadInterceptor } from './image-upload.interceptor';
import { existsSync, readFileSync } from 'fs';

@UseGuards(AuthGuard('jwt'))
@Controller('team-posts')
export class TeamPostController {
  constructor(private readonly postService: TeamPostService) {}

 @Post()
@UseInterceptors(ImageUploadInterceptor('image'))
async createPost(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: CreateTeamPostDto,
  @Request() req
) {
  try {
    const imagePath = file ? `/uploads/team-posts/${file.filename}` : undefined;
    const postData = {
      ...dto,
      image: imagePath
    };
    return await this.postService.createPost(postData, req.user); // req.user هنا سيكون { userId, email }
  } catch (error) {
    throw new InternalServerErrorException('Failed to create post');
  }
}

  @Patch(':id/image')
  @UseInterceptors(ImageUploadInterceptor('image'))
  async updateImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }
    const imagePath = `/uploads/team-posts/${file.filename}`;
    return this.postService.updateImage(id, imagePath, req.user.userId);
  }

  @Get('')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('location') location?: string,
    @Query('date') date?: string
  ) {
    return this.postService.findAll(page, limit, search, location, date);
  }

  @Get('mine')
  async findMine(@Request() req) {
    return this.postService.findMine(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postService.findOne(id);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    return this.postService.remove(id, req.user.userId);
  }

@Patch(':id')
@UseInterceptors(ImageUploadInterceptor('image'))
async update(
  @Param('id', ParseIntPipe) postId: number,
  @Body() updatePostDto: UpdateTeamPostDto,
  @UploadedFile() imageFile: Express.Multer.File,
  @Request() req
) {
  try {
    let imagePath: string | undefined;
    
    if (imageFile) {
      // التحقق من وجود الملف
      if (!imageFile.buffer && !existsSync(imageFile.path)) {
        throw new BadRequestException('Invalid image file');
      }
      
      // حفظ الصورة الجديدة
      imagePath = `/uploads/team-posts/${imageFile.filename}`;
      
      // معالجة الفراغات في المسار
      imagePath = imagePath.replace(/\s+/g, '-');
    }

    return await this.postService.updatePost(
      postId,
      { ...updatePostDto, image: imagePath },
      req.user.userId
    );
  } catch (error) {
    console.error('Update error:', error);
    throw error;
  }
}

private async saveImageToDisk(file: Express.Multer.File): Promise<string> {
  const fs = require('fs');
  const path = require('path');
  const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'team-posts');
  const filename = `${Date.now()}-${file.originalname}`;
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


private async validateImageFile(file: Express.Multer.File) {
    if (!file.buffer && file.path) {
      file.buffer = readFileSync(file.path);
    }

    if (!file.buffer || file.size === 0) {
      throw new BadRequestException('Image file is empty or corrupted');
    }
  }

  private async processImageFile(file: Express.Multer.File): Promise<string> {
    const finalPath = `/uploads/team-posts/${file.filename}`;
    const finalFullPath = `./uploads/team-posts/${file.filename}`;

    try {
      if (!existsSync('./uploads/team-posts')) {
        require('fs').mkdirSync('./uploads/team-posts', { recursive: true });
      }

      require('fs').writeFileSync(finalFullPath, file.buffer);
      return finalPath;
    } catch (error) {
      console.error('Error saving image:', error);
      throw new InternalServerErrorException('Failed to save image');
    }
  }
}