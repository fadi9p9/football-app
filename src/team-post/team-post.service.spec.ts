import { Test, TestingModule } from '@nestjs/testing';
import { TeamPostService } from './team-post.service';

describe('TeamPostService', () => {
  let service: TeamPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamPostService],
    }).compile();

    service = module.get<TeamPostService>(TeamPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
