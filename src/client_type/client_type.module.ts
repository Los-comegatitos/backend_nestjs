import { Module } from '@nestjs/common';
import { ClientTypeService } from './client_type.service';
import { ClientTypeController } from './client_type.controller';

@Module({
  providers: [ClientTypeService],
  controllers: [ClientTypeController],
})
export class ClientTypeModule {}
