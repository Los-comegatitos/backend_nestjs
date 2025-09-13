import { Test, TestingModule } from '@nestjs/testing';
import { EventTypeController } from './event_type.controller';

describe('EventTypeController', () => {
  let controller: EventTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventTypeController],
    }).compile();

    controller = module.get<EventTypeController>(EventTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
