import { Module } from '@nestjs/common';
import { ServiceTypeService } from './service_type.service';
import { ServiceTypeController } from './service_type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceType } from './service_type.entity';

@Module({
  providers: [ServiceTypeService],
  controllers: [ServiceTypeController],
  imports: [TypeOrmModule.forFeature([ServiceType])],
  exports: [ServiceTypeService],
})
export class ServiceTypeModule {}
