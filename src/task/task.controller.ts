import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './task.document';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateTaskDto } from './dto/update-task.dto';

@ApiTags('Tasks')
@Controller('events/:eventId/tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiBearerAuth()
  @Post()
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Create task in an event' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task list', type: Task })
  async create(@Param('eventId') eventId: string, @Body() dto: CreateTaskDto) {
    const task = await this.taskService.createTask(eventId, dto);
    return {
      message: '000',
      description: 'Tasks successfully completed',
      data: task,
    };
  }

  @ApiBearerAuth()
  @Get()
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'List tasks for an event' })
  @ApiResponse({ status: 200, description: 'Task list', type: [Task] })
  async findAll(@Param('eventId') eventId: string) {
    const tasks = await this.taskService.getTasks(eventId);
    return {
      message: '000',
      description: 'Tasks successfully completed',
      data: tasks,
    };
  }

  @ApiBearerAuth()
  @Patch(':taskId')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Update an event task' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Task completed', type: Task })
  async update(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.taskService.updateTask(eventId, taskId, dto);
    return { message: '000', description: 'Task completed', data: task };
  }

  @ApiBearerAuth()
  @Patch(':taskId/finalize')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'End task of an event' })
  @ApiResponse({ status: 200, description: 'Task completed', type: Task })
  async finalize(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
  ) {
    const task = await this.taskService.finalizeTask(eventId, taskId);
    return { message: '000', description: 'Task completed', data: task };
  }

  @ApiBearerAuth()
  @Patch('by-name/:taskName')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Update task by name' })
  async updateByName(
    @Param('eventId') eventId: string,
    @Param('taskName') taskName: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const task = await this.taskService.updateTaskByName(
      eventId,
      taskName,
      dto,
    );
    return { message: '000', description: 'Task updated by name', data: task };
  }

  @ApiBearerAuth()
  @Delete('by-name/:taskName')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Delete task by name' })
  async deleteByName(
    @Param('eventId') eventId: string,
    @Param('taskName') taskName: string,
  ) {
    const task = await this.taskService.deleteTaskByName(eventId, taskName);
    return { message: '000', description: 'Task deleted by name', data: task };
  }
}
