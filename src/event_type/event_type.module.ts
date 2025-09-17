import { Module } from '@nestjs/common';
import { EventTypeService } from './event_type.service';
import { EventTypeController } from './event_type.controller';
@Module({
  providers: [EventTypeService],
  controllers: [EventTypeController],
})
export class EventTypeModule {}
