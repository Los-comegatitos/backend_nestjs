import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from 'src/event/event.document';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { EventModule } from 'src/event/event.module';
import { Task } from './task.document';
// import { EventService } from 'src/event/event.service';
import { Quote, QuoteShema } from 'src/quote/quote.document';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    MongooseModule.forFeature([{ name: Quote.name, schema: QuoteShema }]),
    EventModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, Task],
})
export class TaskModule {}
