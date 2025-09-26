import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './event.document';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventType } from 'src/event_type/event_type.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogService } from 'src/catalog/catalog.service';
import { FilteredEvent } from './event.interfaces';
import { Service } from 'src/service/service.document';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectRepository(EventType)
    private readonly eventTypeRepository: Repository<EventType>,
    private readonly catalogService: CatalogService,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const eventType = await this.eventTypeRepository.findOne({
      where: { id: createEventDto.eventTypeId },
    });
    if (!eventType) {
      throw new NotFoundException(
        `EventType con id ${createEventDto.eventTypeId} no existe`,
      );
    }

    const lastEvent = await this.eventModel
      .findOne()
      .sort({ eventId: -1 })
      .exec();
    const nextEventId = lastEvent ? lastEvent.eventId + 1 : 1;

    const createdEvent = new this.eventModel({
      ...createEventDto,
      eventId: nextEventId,
      status: 'in progress',
    });

    return createdEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async update(
    eventId: number,
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
      throw new NotFoundException(
        `Event con eventId "${eventId}" no encontrado`,
      );
    }

    return updatedEvent;
  }

  async finalize(eventId: number): Promise<Event> {
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

  async findEventsByServiceTypes(
    serviceTypeIds: string[],
  ): Promise<FilteredEvent[]> {
    const events: FilteredEvent[] = (await this.eventModel
      .aggregate([
        // match para eventos cuyos services.serviceTypeId hagan mach con alguno de los serviceTypeIds
        {
          $match: {
            'services.serviceTypeId': { $in: serviceTypeIds },
          },
        }, // devolver solo estos campos deseados
        {
          $project: {
            name: 1,
            description: 1,
            eventDate: 1,
            // Filtrar para solo mostrar services con el mismo serviceTypeId
            services: {
              $filter: {
                input: '$services',
                as: 'service',
                cond: { $in: ['$$service.serviceTypeId', serviceTypeIds] },
              },
            },
          },
        },
      ])
      .exec()) as FilteredEvent[];
    // as FilteredEvent porque es lo que describí en el project
    return events;
  }

  async findEventsForProvider(providerId: number): Promise<FilteredEvent[]> {
    const providerIdString = providerId.toString();
    const serviceTypesId: string[] =
      await this.catalogService.listUsedServiceTypesOnlyId(providerIdString);

    return await this.findEventsByServiceTypes(serviceTypesId);
  }

  async findById(eventId: string): Promise<EventDocument> {
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found.');
    }
    return event;
  }

  async addService(
    eventId: string,
    dto: Partial<Service>,
  ): Promise<EventDocument> {
    const event = await this.findById(eventId);

    const exists = event.services.some((s) => s.name === dto.name);
    if (exists) {
      throw new BadRequestException(
        'Service with this name already exists in the event.',
      );
    }

    // siempre entra con quote null
    event.services.push({ ...dto, quote: null } as Service);

    return event.save();
  }

  async removeService(
    eventId: string,
    serviceName: string,
  ): Promise<EventDocument> {
    const event = await this.findById(eventId);

    const service = event.services.find((s) => s.name === serviceName);
    if (!service) {
      throw new NotFoundException('Service with this name not found.');
    }

    if (service.quote) {
      throw new BadRequestException(
        'Cannot remove a service that already has a quote.',
      );
    }

    const initialLength = event.services.length;

    // TODO filter pa fuera de service
    // event.services = event.services.filter((s) => s.name !== serviceName);

    if (event.services.length === initialLength) {
      throw new NotFoundException('Service with this name not found.');
    }

    return event.save();
  }

  async updateService(
    eventId: string,
    serviceName: string,
    dto: Partial<Service>,
  ): Promise<EventDocument> {
    const event = await this.findById(eventId);

    const serviceToUpdate = event.services.find((s) => s.name === serviceName);
    if (!serviceToUpdate) {
      throw new NotFoundException('Service with this name not found.');
    }

    if (serviceToUpdate.quote) {
      throw new BadRequestException(
        'Cannot modify a service that already has a quote.',
      );
    }

    Object.assign(serviceToUpdate, dto);
    return event.save();
  }

  async addQuote(
    eventId: string,
    serviceName: string,
    quoteDto: {
      date: Date;
      quantity: number;
      price: number;
      serviceTypeId: string;
      providerId: string;
    },
  ): Promise<EventDocument> {
    const event = await this.findById(eventId);

    const service = event.services.find((s) => s.name === serviceName);
    if (!service) {
      throw new NotFoundException('Service with this name not found.');
    }

    if (service.quote) {
      throw new BadRequestException('Service already has a quote.');
    }

    service.quote = quoteDto;
    return event.save();
  }
}
