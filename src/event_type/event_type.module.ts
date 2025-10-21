import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventTypeService } from './event_type.service';
import { EventTypeController } from './event_type.controller';
import { EventType } from './event_type.entity';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([EventType]), EventModule],
  providers: [EventTypeService],
  controllers: [EventTypeController],
  exports: [EventTypeService],
})
export class EventTypeModule {}
