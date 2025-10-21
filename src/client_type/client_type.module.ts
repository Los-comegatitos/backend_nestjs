import { forwardRef, Module } from '@nestjs/common';
import { ClientTypeService } from './client_type.service';
import { ClientTypeController } from './client_type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientType } from './client_type.entity';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientType]),
    forwardRef(() => EventModule),
  ],
  providers: [ClientTypeService],
  controllers: [ClientTypeController],
  exports: [ClientTypeService],
})
export class ClientTypeModule {}
