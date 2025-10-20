import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskProviderController } from './task-provider.controller';
import { EventModule } from 'src/event/event.module';

@Module({
  imports: [EventModule],
  controllers: [TaskController, TaskProviderController],
  providers: [TaskService],
  exports: [TaskService],
})
export class TaskModule {}
