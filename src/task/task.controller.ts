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
  ApiParam,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateTaskDto } from './dto/update-task.dto';
import { EventService } from 'src/event/event.service';

@ApiTags('Tasks')
@Controller('events/:eventId/tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly eventService: EventService,
  ) {}

  @ApiBearerAuth()
  @Post()
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Create task in an event' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task list', type: Task })
  async create(@Param('eventId') eventId: string, @Body() dto: CreateTaskDto) {
    const task = await this.taskService.createTask(eventId, dto);
    return {
      message: '201',
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
      message: '201',
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
    return { message: '201', description: 'Task completed', data: task };
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
    return { message: '201', description: 'Task completed', data: task };
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
    return { message: '201', description: 'Task updated by name', data: task };
  }

  @ApiBearerAuth()
  @Delete(':taskId')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Delete task by id' })
  @ApiResponse({ status: 200, description: 'Task deleted', type: Task })
  async delete(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
  ) {
    const task = await this.taskService.deleteTaskById(eventId, taskId);
    return {
      message: '201',
      description: 'Task deleted successfully',
      data: task,
    };
  }

  @ApiBearerAuth()
  @Patch(':eventId/tasks/:taskId/assign-provider/:providerId')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Asignar proveedor a una tarea' })
  @ApiParam({ name: 'eventId', type: String })
  @ApiParam({ name: 'taskId', type: String })
  @ApiParam({ name: 'providerId', type: String })
  @ApiResponse({ status: 200, description: 'Proveedor asignado', type: Event })
  async assignProvider(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
    @Param('providerId') providerId: string,
  ) {
    const event = await this.taskService.assignProviderToTask(
      eventId,
      taskId,
      providerId,
    );
    return { message: '201', description: 'Proveedor asignado', data: event };
  }

  @ApiBearerAuth()
  @Patch(':eventId/tasks/:taskId/unassign-provider')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Desasignar proveedor de una tarea' })
  @ApiParam({ name: 'eventId', type: String })
  @ApiParam({ name: 'taskId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Proveedor desasignado',
    type: Event,
  })
  async unassignProvider(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
  ) {
    const event = await this.taskService.unassignProviderFromTask(
      eventId,
      taskId,
    );
    return {
      message: '201',
      description: 'Proveedor desasignado',
      data: event,
    };
  }
}
