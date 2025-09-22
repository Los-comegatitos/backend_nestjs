import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventType } from './event_type.entity';
import { CreateEventTypeDto } from './dto/create-event_type.dto';
import { UpdateEventTypeDto } from './dto/update-event_type.dto';

@Injectable()
export class EventTypeService {
  constructor(
    @InjectRepository(EventType)
    private readonly eventTypeRepository: Repository<EventType>,
  ) {}

  async create(dto: CreateEventTypeDto): Promise<EventType> {
    const exists = await this.eventTypeRepository.findOne({
      where: { name: dto.name },
    });
    if (exists) {
      throw new BadRequestException(
        `EventType with name "${dto.name}" already exists`,
      );
    }

    const newType = this.eventTypeRepository.create(dto);
    return this.eventTypeRepository.save(newType);
  }

  async findAll(): Promise<EventType[]> {
    return this.eventTypeRepository.find();
  }

  async findOneByName(name: string) {
    const typeclient = await this.eventTypeRepository.findOneBy({ name });
    if (!typeclient) throw new NotFoundException('Event type not found');
    return typeclient;
  }

  async findOne(id: number): Promise<EventType> {
    const eventType = await this.eventTypeRepository.findOne({ where: { id } });
    if (!eventType) throw new NotFoundException('Event type not found');
    return eventType;
  }

  async update(id: number, dto: UpdateEventTypeDto): Promise<EventType> {
    const eventType = await this.findOne(id);

    if (dto.name && dto.name !== eventType.name) {
      const exists = await this.eventTypeRepository.findOne({
        where: { name: dto.name },
      });
      if (exists) {
        throw new BadRequestException(
          `EventType with name "${dto.name}" already exists`,
        );
      }
    }

    Object.assign(eventType, dto);
    return this.eventTypeRepository.save(eventType);
  }

  async remove(id: number): Promise<{ message: string }> {
    const eventType = await this.findOne(id);
    await this.eventTypeRepository.remove(eventType);
    return { message: 'Event Type deleted successfully' };
  }
}
