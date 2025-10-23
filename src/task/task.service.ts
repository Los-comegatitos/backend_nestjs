import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { Attachment, Task } from './task.document';
import { UpdateTaskDto } from './dto/update-task.dto';
import { v4 as uuidv4 } from 'uuid';
import { EventService } from 'src/event/event.service';
import { GridFSBucket } from 'mongodb';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { Readable } from 'stream';
import { EventDocument } from 'src/event/event.document';
import { ForbiddenException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './task.document';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
import { Notification_type } from 'src/notification/notification.enum';

@Injectable()
export class TaskService {
  private gridFSBucket: GridFSBucket;

  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly eventService: EventService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
  ) {
    this.gridFSBucket = new GridFSBucket(this.connection.db!, {
      bucketName: 'files',
    });
  }

  // NO USEN ESTO, BORRARÁ TODO
  // async resetBucket() {
  //   await this.gridFSBucket.drop();
  // }

  uploadFile(
    fileStream: NodeJS.ReadableStream,
    filename: string,
    fileType: string,
  ): Promise<any> {
    // const safeFilename = Buffer.from(filename, 'latin1').toString('utf8');
    return new Promise((resolve, reject) => {
      const uploadStream = this.gridFSBucket.openUploadStream(filename, {
        metadata: {
          contentType: fileType,
        },
      });
      fileStream.pipe(uploadStream).on('error', reject).on('finish', resolve);
    });
  }

  async getFileStream(fileId: string) {
    const filesCursor = this.gridFSBucket.find({ filename: fileId });
    const files = await filesCursor.toArray();

    if (!files.length) {
      throw new NotFoundException(`Archivo "${fileId}" no encontrado`);
    }

    const stream = this.gridFSBucket.openDownloadStreamByName(fileId);

    const file = files[0];

    return {
      stream: stream,
      type: file?.metadata?.['contentType'] as string,
    };
  }

  async createTask(eventId: string, dto: CreateTaskDto): Promise<Task> {
    const event = await this.eventService.findByStringId(eventId);
    if (!event) {
      throw new NotFoundException(`Evento con id ${eventId} no existe`);
    }

    const taskId = uuidv4();

    const newTask: Task = {
      id: taskId,
      name: dto.name,
      description: dto.description,
      creationDate: new Date(),
      reminderDate: dto.reminderDate,
      dueDate: dto.dueDate,
      status: 'pending',
      completionDate: null,
      attachments: [],
      comments: [],
      associatedProviderId: null,
    };

    event.tasks.push(newTask);
    await event.save();

    return newTask;
  }

  async getTasks(eventId: string): Promise<Task[]> {
    const event = await this.eventService.findByStringId(eventId);
    if (!event) {
      throw new NotFoundException(`Evento con id ${eventId} no existe`);
    }
    return event.tasks;
  }

  async updateTask(
    eventId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const event = await this.eventService.findByStringId(eventId);
    if (!event) {
      throw new NotFoundException(`Evento con id ${eventId} no existe`);
    }

    const task = event.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new NotFoundException(`Tarea con id ${taskId} no encontrada`);
    }

    Object.assign(task, updateTaskDto);
    await event.save();

    return task;
  }

  async finalizeTask(eventId: string, taskId: string): Promise<Task> {
    const event = await this.eventService.findByStringId(eventId);
    if (!event) {
      throw new NotFoundException(`Evento con id ${eventId} no existe`);
    }

    const task = event.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new NotFoundException(`Tarea con id ${taskId} no existe`);
    }

    if (task.status === 'completed') {
      throw new BadRequestException('La tarea ya ha sido completada');
    }

    task.status = 'completed';
    task.completionDate = new Date();

    await event.save();

    if (task.associatedProviderId) {
      const email = (
        await this.userService.findById(parseInt(task.associatedProviderId))
      ).email;

      await this.notificationService.sendEmail({
        emails: [email],
        type: Notification_type.task_assigned,
        route: event.name,
        url: `/events-providers/${event.eventId}/task-providers`,
      });
    }

    return task;
  }

  async updateTaskByName(
    eventId: string,
    taskName: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const event = await this.eventService.findByStringId(eventId);
    if (!event)
      throw new NotFoundException(`Evento con id  ${eventId} no existe`);

    const task = event.tasks.find((t) => t.name === taskName);
    if (!task)
      throw new NotFoundException(`Tarea: "${taskName}" no encontrada`);

    Object.assign(task, updateTaskDto);
    await event.save();

    return task;
  }

  async deleteTaskById(eventId: string, taskId: string): Promise<Task> {
    const event = await this.eventService.findByStringId(eventId);
    if (!event) {
      throw new NotFoundException(`Evento con id ${eventId} no existe`);
    }

    const taskIndex = event.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new NotFoundException(`Tarea con id "${taskId}" no encontrado`);
    }

    const [removedTask] = event.tasks.splice(taskIndex, 1);
    await event.save();

    // ????????????????????????????????????????????????????????????????????????????????????????
    // if (removedTask.associatedProviderId) {
    //   console.log(
    //     `Notificación: La tarea "${removedTask.name}" del evento ${eventId} fue eliminada. Proveedor asociado: ${removedTask.associatedProviderId}`,
    //   );
    // }
    // ?????????????????????????????????????????????????????????????

    return removedTask;
  }

  async savingFile(eventId: string, taskId: string, file: Express.Multer.File) {
    const event = await this.eventService.findByStringId(eventId);
    if (!event) {
      throw new NotFoundException(`Evento con id ${eventId} no existe`);
    }

    const task = event.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new NotFoundException(`Tarea con nombre ${taskId} no encontrada`);
    }
    const safeFilename = Buffer.from(file.originalname, 'latin1').toString(
      'utf8',
    );
    const pieces = safeFilename.lastIndexOf('.');
    const hiddenName = `${safeFilename.substring(0, pieces)}-${eventId}-${taskId}-${task.attachments.length + 1}${safeFilename.substring(pieces)}`;
    const stream = Readable.from(file.buffer);
    await this.uploadFile(stream, hiddenName, file.mimetype);
    const attachment = new Attachment();
    attachment.id = hiddenName;
    attachment.fileName = safeFilename;
    task.attachments.push(attachment);
    await event.save();
    return {
      description: 'Archivo subido éxitosamente',
      data: task,
    };
  }

  async obtainingFile(eventId: string, taskId: string, fileId: string) {
    const event = await this.eventService.findByStringId(eventId);
    if (!event) {
      throw new NotFoundException(`Evento con id ${eventId} no existe`);
    }

    const task = event.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new NotFoundException(`Tarea con nombre ${taskId} no encontrada`);
    }

    return await this.getFileStream(fileId);
  }

  async assignProviderToTask(
    eventId: string,
    taskId: string,
    providerId: string,
  ): Promise<EventDocument> {
    const event = await this.eventModel.findOne({ eventId });

    if (!event) {
      throw new NotFoundException('El evento no existe.');
    }

    const task = event.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new NotFoundException('La tarea no existe en este evento.');
    }

    if (task.associatedProviderId) {
      throw new BadRequestException('La tarea ya tiene un proveedor asignado.');
    }

    const providerIsValid = event.services.some(
      (s) => s.quote?.providerId === providerId,
    );
    if (!providerIsValid) {
      throw new BadRequestException(
        'El proveedor no está ofreciendo servicios en este evento.',
      );
    }

    task.associatedProviderId = providerId;

    const info = await event.save();

    const email = (await this.userService.findById(parseInt(providerId))).email;

    await this.notificationService.sendEmail({
      emails: [email],
      type: Notification_type.task_assigned,
      route: event.name,
      url: `/events-providers/${event.eventId}/task-providers`,
    });

    return info;
  }

  async unassignProviderFromTask(
    eventId: string,
    taskId: string,
  ): Promise<EventDocument> {
    const event = await this.eventModel.findOne({ eventId });

    if (!event) {
      throw new NotFoundException('El evento no existe.');
    }

    const task = event.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new NotFoundException('La tarea no existe en este evento.');
    }

    if (!task.associatedProviderId) {
      throw new BadRequestException(
        'La tarea no tiene ningún proveedor asignado.',
      );
    }

    const id = task.associatedProviderId;

    task.associatedProviderId = null;

    const info = await event.save();

    const email = (await this.userService.findById(parseInt(id))).email;

    await this.notificationService.sendEmail({
      emails: [email],
      type: Notification_type.task_assigned,
      route: event.name,
      url: `/events-providers/${event.eventId}/task-providers`,
    });

    return info;
  }

  async addCommentAsOrganizer(
    eventId: string,
    taskId: string,
    dto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);

    const task = event.tasks.find((t) => t.id === taskId);
    if (!task) throw new NotFoundException(`Task with id ${taskId} not found`);

    const newComment: Comment = {
      idUser: userId,
      userType: 'organizer',
      date: new Date(),
      description: dto.description,
    };

    task.comments.push(newComment);
    await event.save();

    return newComment;
  }

  async addCommentAsProvider(
    eventId: string,
    taskId: string,
    dto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);

    const task = event.tasks.find((t) => t.id === taskId);
    if (!task) throw new NotFoundException(`Task with id ${taskId} not found`);

    if (task.associatedProviderId !== userId.toString()) {
      throw new ForbiddenException(
        'Provider cannot comment because they are not assigned to this task',
      );
    }

    const newComment: Comment = {
      idUser: userId,
      userType: 'provider',
      date: new Date(),
      description: dto.description,
    };

    task.comments.push(newComment);
    await event.save();

    return newComment;
  }

  async getTaskComments(
    eventId: string,
    taskId: string,
    userId: string,
    userType: 'organizer' | 'provider',
  ): Promise<Comment[]> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event)
      throw new NotFoundException(`Event with id ${eventId} not found`);

    const task = event.tasks.find((t) => t.id === taskId);
    if (!task) throw new NotFoundException(`Task with id ${taskId} not found`);

    if (
      userType === 'provider' &&
      task.associatedProviderId !== userId.toString()
    ) {
      throw new ForbiddenException(
        'Provider cannot view comments of a task they are not assigned to',
      );
    }

    // orden cronologico (mas antiguos primero) obviamente :v
    return task.comments.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }

  /*async getTasksForProvider(
    eventId: string,
    providerId: string,
  ): Promise<Task[]> {
    const event = await this.eventService.findByStringId(eventId);
    if (!event) {
      throw new NotFoundException(`Evento con id ${eventId} no existe`);
    }

    const tasksForProvider = event.tasks.filter(
      (t) => t.associatedProviderId === providerId,
    );

    if (!tasksForProvider.length) {
      throw new ForbiddenException(
        'No tienes tareas asignadas en este evento o no estás autorizado a verlas',
      );
    }

    return tasksForProvider;
  }*/

  async getTasksForProvider(providerId: string): Promise<
    {
      eventId: string;
      eventName: string;
      task: Task;
    }[]
  > {
    const events = await this.eventModel.find({
      'tasks.associatedProviderId': providerId,
    });

    if (!events.length) {
      throw new ForbiddenException(
        'You have no tasks assigned in any event or you are not authorized to view them',
      );
    }

    const providerTasks: {
      eventId: string;
      eventName: string;
      task: Task;
    }[] = [];

    for (const event of events) {
      const tasksForProvider = event.tasks.filter(
        (t) => t.associatedProviderId === providerId,
      );

      for (const task of tasksForProvider) {
        providerTasks.push({
          eventId: event.eventId,
          eventName: event.name,
          task: task,
        });
      }
    }

    return providerTasks;
  }
}
