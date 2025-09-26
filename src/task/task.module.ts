import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { Task } from './task.document';

@Module({
  providers: [TaskService, Task],
  controllers: [TaskController],
})
export class TaskModule {}
