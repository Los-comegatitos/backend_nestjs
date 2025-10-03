import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from 'src/event/event.document';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './task.document';
import { UpdateTaskDto } from './dto/update-task.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
  ) {}

  async createTask(eventId: string, dto: CreateTaskDto): Promise<Task> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event con id ${eventId} no existe`);
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
      associatedProviderId: dto.associatedProviderId ?? null,
    };

    event.tasks.push(newTask);
    await event.save();

    return newTask;
  }

  async getTasks(eventId: string): Promise<Task[]> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event con id ${eventId} no existe`);
    }
    return event.tasks;
  }

  async updateTask(
    eventId: string,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event con id ${eventId} no existe`);
    }

    const task = event.tasks.id(taskId);
    if (!task) {
      throw new NotFoundException(`Task con id ${taskId} no encontrada`);
    }

    Object.assign(task, updateTaskDto);
    await event.save();

    return task;
  }

  async finalizeTask(eventId: string, taskId: string): Promise<Task> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} does not exist`);
    }

    const task = event.tasks.id(taskId);
    if (!task) {
      throw new NotFoundException(`Event with id  ${taskId} not found`);
    }

    if (task.status === 'completed') {
      throw new BadRequestException('The task is now complete');
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
    const event = await this.eventModel.findOne({ eventId });
    if (!event)
      throw new NotFoundException(`Event with id  ${eventId} does not exist`);

    const task = event.tasks.find((t) => t.name === taskName);
    if (!task) throw new NotFoundException(`Task: "${taskName}" not found`);

    Object.assign(task, updateTaskDto);
    await event.save();

    return task;
  }
  async deleteTaskById(eventId: string, taskId: string): Promise<Task> {
    const event = await this.eventModel.findOne({ eventId });
    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} does not exist`);
    }

    const taskIndex = event.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new NotFoundException(`Task with id "${taskId}" not found`);
    }

    const [removedTask] = event.tasks.splice(taskIndex, 1);
    await event.save();

    if (removedTask.associatedProviderId) {
      console.log(
        `Notification: The task"${removedTask.name}" of the event ${eventId} was eliminated. Associated provider: ${removedTask.associatedProviderId}`,
      );
    }

    return removedTask;
  }
}
