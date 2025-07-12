import { Test, TestingModule } from '@nestjs/testing';
import { TeamPostController } from './team-post.controller';

describe('TeamPostController', () => {
  let controller: TeamPostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TeamPostController],
    }).compile();

    controller = module.get<TeamPostController>(TeamPostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
