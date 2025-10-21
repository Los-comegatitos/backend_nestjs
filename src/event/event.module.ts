import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event.document';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { EventType } from 'src/event_type/event_type.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from 'src/catalog/catalog.module';
import { QuoteModule } from 'src/quote/quote.module';
import { Quote, QuoteShema } from 'src/quote/quote.document';
import { User } from 'src/user/user.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';
import { ClientTypeModule } from 'src/client_type/client_type.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Quote.name, schema: QuoteShema },
    ]),
    TypeOrmModule.forFeature([EventType]),
    TypeOrmModule.forFeature([EventType, User]),
    CatalogModule,
    forwardRef(() => ClientTypeModule),
    forwardRef(() => QuoteModule),
    NotificationModule,
    UserModule,
  ],
  providers: [EventService],
  controllers: [EventController],
  exports: [EventService, MongooseModule],
})
export class EventModule {}
