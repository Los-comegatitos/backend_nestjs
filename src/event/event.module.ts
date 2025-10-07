import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event.document';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventType } from 'src/event_type/event_type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from 'src/catalog/catalog.module';
import { QuoteModule } from 'src/quote/quote.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    TypeOrmModule.forFeature([EventType]),
    CatalogModule,
    forwardRef(() => QuoteModule), // 👈 opcional pero más seguro si ambos se importan mutuamente
  ],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService, MongooseModule],
})
export class EventModule {}
