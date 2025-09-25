import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './event.document';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventType } from 'src/event_type/event_type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectRepository(EventType)
    private readonly eventTypeRepository: Repository<EventType>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const existingEvent = await this.eventModel.findOne({
      eventId: createEventDto.eventId,
    });
    if (existingEvent) {
      throw new ConflictException(
        `El eventId "${createEventDto.eventId}" ya existe`,
      );
    }

    const eventType = await this.eventTypeRepository.findOne({
      where: { id: createEventDto.eventTypeId },
    });

    if (!eventType) {
      throw new NotFoundException(
        `EventType con id ${createEventDto.eventTypeId} no existe`,
      );
    }

    const createdEvent = new this.eventModel(createEventDto);
    return createdEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async update(
    eventId: string,
    updateEventDto: UpdateEventDto,
  ): Promise<Event> {
    if (updateEventDto.eventTypeId) {
      const eventType = await this.eventTypeRepository.findOne({
        where: { id: updateEventDto.eventTypeId },
      });

      if (!eventType) {
        throw new NotFoundException(
          `EventType con id ${updateEventDto.eventTypeId} no existe`,
        );
      }
    }

    const updatedEvent = await this.eventModel.findOneAndUpdate(
      { eventId },
      updateEventDto,
      { new: true },
    );

    if (!updatedEvent) {
      throw new NotFoundException(`Event with eventId "${eventId}" not found`);
    }
    return updatedEvent;
  }

  async finalize(eventId: string): Promise<Event> {
    const event = await this.eventModel.findOneAndUpdate(
      { eventId },
      { status: 'finalized' },
      { new: true },
    );

    if (!event) {
      throw new NotFoundException(
        `Event con eventId "${eventId}" no encontrado`,
      );
    }

    return event;
  }
}
