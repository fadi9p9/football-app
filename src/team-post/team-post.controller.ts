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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TeamPostService } from './team-post.service';
import { CreateTeamPostDto } from './dto/create-team-post.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('team-posts')
export class TeamPostController {
  constructor(private readonly postService: TeamPostService) {}

  @Post('')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/team-posts',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(
            file.originalname,
          )}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async createWithImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateTeamPostDto,
    @Request() req,
  ) {
    const imagePath = file ? `/uploads/team-posts/${file.filename}` : null;
    return this.postService.create({ ...dto, image: imagePath }, req.user);
  }


@Patch(':id/image')
@UseInterceptors(
  FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/team-posts',
      filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(
          file.originalname,
        )}`;
        cb(null, uniqueName);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        cb(new Error('Only image files are allowed!'), false);
      } else {
        cb(null, true);
      }
    },
  }),
)
updateImage(
  @Param('id', ParseIntPipe) id: number,
  @UploadedFile() file: Express.Multer.File,
  @Request() req,
) {
  const imagePath = file ? `/uploads/team-posts/${file.filename}` : null;
  return this.postService.update(id, { image: imagePath }, req.user.userId);
}

  
}
