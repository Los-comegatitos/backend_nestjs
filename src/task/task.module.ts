import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { EventModule } from 'src/event/event.module';
import { UserModule } from 'src/user/user.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [EventModule, UserModule, NotificationModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
