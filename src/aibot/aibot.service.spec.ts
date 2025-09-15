import { Test, TestingModule } from '@nestjs/testing';
import { AibotService } from './aibot.service';

describe('AibotService', () => {
  let service: AibotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AibotService],
    }).compile();

    service = module.get<AibotService>(AibotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
