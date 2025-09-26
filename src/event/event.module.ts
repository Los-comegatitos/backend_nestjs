import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event, EventSchema } from './event.document';
import { EventType } from 'src/event_type/event_type.entity';
import { CatalogModule } from 'src/catalog/catalog.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),

    TypeOrmModule.forFeature([EventType]),
    CatalogModule,
  ],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
