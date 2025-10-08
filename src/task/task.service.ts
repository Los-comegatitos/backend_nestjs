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
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Readable } from 'stream';

@Injectable()
export class TaskService {
  private gridFSBucket: GridFSBucket;

  constructor(
    // @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly eventService: EventService,
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
    const event = await this.eventService.findById(eventId);
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
    const event = await this.eventService.findById(eventId);
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
    const event = await this.eventService.findById(eventId);
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
    const event = await this.eventService.findById(eventId);
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
    return task;
  }

  async updateTaskByName(
    eventId: string,
    taskName: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const event = await this.eventService.findById(eventId);
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
    const event = await this.eventService.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Evento con id ${eventId} no existe`);
    }

    const taskIndex = event.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new NotFoundException(`Tarea con id "${taskId}" no encontrado`);
    }

    const [removedTask] = event.tasks.splice(taskIndex, 1);
    await event.save();

    if (removedTask.associatedProviderId) {
      console.log(
        `Notificación: La tarea "${removedTask.name}" del evento ${eventId} fue eliminada. Proveedor asociado: ${removedTask.associatedProviderId}`,
      );
    }

    return removedTask;
  }

  async savingFile(eventId: string, taskId: string, file: Express.Multer.File) {
    const event = await this.eventService.findByStringId(eventId);
    if (!event) {
      throw new NotFoundException(`Evento con id ${eventId} no existe`);
    }

    const task = event.tasks.find((t) => t.name === taskId);
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

    const task = event.tasks.find((t) => t.name === taskId);
    if (!task) {
      throw new NotFoundException(`Tarea con nombre ${taskId} no encontrada`);
    }

    return await this.getFileStream(fileId);
  }
}
