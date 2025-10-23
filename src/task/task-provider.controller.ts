import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { RolesGuard } from 'src/auth/roles.guard';
import { TaskService } from './task.service';
import { Request as ExpressRequest } from 'express';

@Controller('task')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskProviderController {
  constructor(private readonly taskService: TaskService) {}

  @Get('provider')
  @Roles(Role.Provider)
  async getTasksForProvider(@Req() req: ExpressRequest) {
    const { userId } = req.user as { userId: number; role: Role };

    // console.log('userId recibido en provider:', userId);

    const tasks = await this.taskService.getTasksForProvider(userId.toString());

    // console.log('tareas encontradas:', tasks);

    return {
      message: '000',
      description: 'Tasks retrieved successfully for provider',
      data: tasks,
    };
  }
}
