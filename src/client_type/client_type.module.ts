import { Module } from '@nestjs/common';
import { ClientTypeService } from './client_type.service';
import { ClientTypeController } from './client_type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientType } from './client_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClientType])],
  providers: [ClientTypeService],
  controllers: [ClientTypeController],
})
export class ClientTypeModule {}
