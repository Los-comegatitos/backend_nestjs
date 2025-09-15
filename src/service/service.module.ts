import { Module } from '@nestjs/common';
import { ServiceService } from './service.service';
import { ServiceController } from './service.controller';

@Module({
  providers: [ServiceService],
  controllers: [ServiceController]
})
export class ServiceModule {}
