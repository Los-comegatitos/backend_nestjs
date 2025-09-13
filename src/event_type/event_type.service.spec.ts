import { Test, TestingModule } from '@nestjs/testing';
import { EventTypeService } from './event_type.service';

describe('EventTypeService', () => {
  let service: EventTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventTypeService],
    }).compile();

    service = module.get<EventTypeService>(EventTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
