import { Test, TestingModule } from '@nestjs/testing';
import { AibotController } from './aibot.controller';

describe('AibotController', () => {
  let controller: AibotController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AibotController],
    }).compile();

    controller = module.get<AibotController>(AibotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
