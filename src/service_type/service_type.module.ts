import { Module } from '@nestjs/common';
import { ServiceTypeService } from './service_type.service';
import { ServiceTypeController } from './service_type.controller';

@Module({
  providers: [ServiceTypeService],
  controllers: [ServiceTypeController],
})
export class ServiceTypeModule {}
