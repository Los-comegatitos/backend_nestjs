import { Test, TestingModule } from '@nestjs/testing';
import { ClientTypeController } from './client_type.controller';

describe('ClientTypeController', () => {
  let controller: ClientTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClientTypeController],
    }).compile();

    controller = module.get<ClientTypeController>(ClientTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
