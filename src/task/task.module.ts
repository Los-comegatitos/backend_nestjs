import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { Event, EventSchema } from 'src/event/event.document';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { EventModule } from 'src/event/event.module';
import { Task } from './task.document';
// import { EventService } from 'src/event/event.service';

@Module({
  imports: [
    // MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    EventModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, Task],
})
export class TaskModule {}
