import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Patch,
  Req,
  Delete,
  UploadedFile,
  UseInterceptors,
  Res,
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
  ApiConsumes,
  ApiProduces,
} from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Request as ExpressRequest } from 'express';

@ApiBearerAuth()
@ApiTags('Tasks')
@Controller('events/:eventId/tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

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
      message: '000',
      description: 'Task deleted successfully',
      data: task,
    };
  }

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
    return { message: '000', description: 'Proveedor asignado', data: event };
  }

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
      message: '000',
      description: 'Proveedor desasignado',
      data: event,
    };
  }
  @Post(':taskId/file')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Upload file for a task' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: File,
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const task = await this.taskService.savingFile(eventId, taskId, file);
    return {
      description: 'File uploaded successfully',
      data: task,
    };
  }

  @Get(':taskId/file/:fileId')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'download file for a task' })
  @ApiProduces('application/octet-stream')
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async downloadFile(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    // return this.taskService.getFileStream(fileId);
    const info = await this.taskService.obtainingFile(eventId, taskId, fileId);

    res.setHeader('Content-Disposition', `attachment; filename="${fileId}"`);
    res.setHeader('Content-Type', info.type);

    info.stream.pipe(res);
  }

  // @Delete('files/:id')
  // @ApiOperation({ summary: 'ESTO BORRA TODOS LOS ARCHIVOS Y SU BUCKET, NO LO USEN EL FRONTEND' })
  // async kickthebucket(
  //   @Param('eventId') eventId: string,
  //   @Param('id') id: string,
  // ) {
  //   console.log(eventId);
  //   console.log(id);
  //   return await this.taskService.resetBucket();
  // }

  @ApiBearerAuth()
  @Patch(':taskId/comment')
  @Roles(Role.Organizer, Role.Provider)
  @ApiOperation({ summary: 'Add comment to a task' })
  @ApiBody({ type: CreateCommentDto })
  async addComment(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: ExpressRequest,
  ) {
    const { userId, role } = req.user as {
      userId: number;
      email: string;
      role: Role;
    };

    const userType = role === Role.Organizer ? 'organizer' : 'provider';

    const comment = await this.taskService.addComment(
      eventId,
      taskId,
      dto,
      userId.toString(),
      userType,
    );

    return {
      message: '000',
      description: 'Comment added successfully',
      data: comment,
    };
  }

  @ApiBearerAuth()
  @Get(':taskId')
  @Roles(Role.Organizer, Role.Provider)
  @ApiOperation({ summary: 'Get task details including comments' })
  async getTaskById(
    @Param('eventId') eventId: string,
    @Param('taskId') taskId: string,
    @Req() req: ExpressRequest,
  ) {
    const { userId, role } = req.user as {
      userId: number;
      email: string;
      role: Role;
    };

    const userType = role === Role.Organizer ? 'organizer' : 'provider';

    const task = await this.taskService.getTaskById(
      eventId,
      taskId,
      userId.toString(),
      userType,
    );

    return {
      message: '000',
      description: 'Task retrieved successfully',
      data: task,
    };
  }
}
