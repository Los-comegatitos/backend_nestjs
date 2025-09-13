import { Test, TestingModule } from '@nestjs/testing';
import { ClientTypeService } from './client_type.service';

describe('ClientTypeService', () => {
  let service: ClientTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientTypeService],
    }).compile();

    service = module.get<ClientTypeService>(ClientTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
