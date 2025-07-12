import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamPost } from './team-post.entity';
import { TeamPostService } from './team-post.service';
import { TeamPostController } from './team-post.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeamPost])], 
  controllers: [TeamPostController],
  providers: [TeamPostService],
})
export class TeamPostModule {}
