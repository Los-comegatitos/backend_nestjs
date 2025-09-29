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
import { AddServiceDto } from './dto/event-service.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectRepository(EventType)
    private readonly eventTypeRepository: Repository<EventType>,
    private readonly catalogService: CatalogService,
  ) {}

  async create(
    createEventDto: CreateEventDto,
    organizerId: number,
  ): Promise<Event> {
    const organizerIdString = organizerId.toString();

    // validacion eventType
    const eventType = await this.eventTypeRepository.findOne({
      where: { id: createEventDto.eventTypeId },
    });
    if (!eventType) {
      throw new NotFoundException(
        `El tipo de evento con id ${createEventDto.eventTypeId} no existe`,
      );
    }

    // TODO debería aquí validación clientType
    //

    const lastEvent = await this.eventModel
      .findOne()
      .sort({ eventId: -1 })
      .exec();
    const nextEventId = lastEvent ? lastEvent.eventId + 1 : 1;

    const createdEvent = new this.eventModel({
      ...createEventDto,
      organizerUserId: organizerIdString,
      eventId: nextEventId,
      status: 'in progress',
    });

    return createdEvent.save();
  }

  async findAll(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async findAllOrganizer(organizerId: number): Promise<Event[]> {
    const organizerIdString = organizerId.toString();

    return this.eventModel.find({ organizerUserId: organizerIdString }).exec();
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
          `El tipo de evento con id ${updateEventDto.eventTypeId} no existe`,
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
        `El evento con eventId "${eventId}" no encontrado`,
      );
    }

    return updatedEvent;
  }

  async finalize(eventId: number, organizerId: number): Promise<Event> {
    const organizerIdString = organizerId.toString();

    const event = await this.eventModel.findOneAndUpdate(
      { eventId: eventId, organizerUserId: organizerIdString },
      { status: 'finalized' },
      { new: true },
    );

    if (!event) {
      throw new NotFoundException(
        `Evento con eventId "${eventId}" de organizadorId "${organizerIdString}" no encontrado`,
      );
    }

    return event;
  }

  async cancelEvent(eventId: number, organizerId: number): Promise<Event> {
    const organizerIdString = organizerId.toString();

    const event = await this.eventModel.findOneAndUpdate(
      { eventId: eventId, organizerUserId: organizerIdString },
      { status: 'canceled' },
      { new: true },
    );

    if (!event) {
      throw new NotFoundException(
        `Evento con eventId "${eventId}" de organizadorId "${organizerIdString}" no encontrado`,
      );
    }

    return event;
  }

  async findEventsByServiceTypes(
    serviceTypeIds: string[],
  ): Promise<FilteredEvent[]> {
    console.log('serviceTypeIds', serviceTypeIds);
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

    console.log('events', events);

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
      throw new NotFoundException(
        `El evento con el id ${eventId} no fue encontrado.`,
      );
    }
    return event;
  }

  async findByIdValidated(
    eventId: string,
    organizerId: number,
  ): Promise<EventDocument> {
    const organizerIdString = organizerId.toString();
    const event = await this.eventModel.findOne({
      eventId: eventId,
      organizerUserId: organizerIdString,
    });

    if (!event) {
      throw new NotFoundException(
        `El evento con el id ${eventId} no fue encontrado para el usuario ${organizerIdString}.`,
      );
    }

    return event;
  }

  async addService(
    eventId: string,
    dto: AddServiceDto,
  ): Promise<EventDocument> {
    const event = await this.eventModel.findOne({ eventId: eventId });

    if (!event) {
      throw new BadRequestException('El evento no existe');
    }

    const exists = event.services.some((s) => s.name === dto.name);
    if (exists) {
      throw new BadRequestException(
        'Un servicio con este nombre ya existe en el evento.',
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
    const event = await this.eventModel.findOne({ eventId: eventId });

    if (!event) {
      throw new BadRequestException('El evento no existe.');
    }

    const service = event.services.find((s) => s.name === serviceName);
    if (!service) {
      throw new NotFoundException(
        'El servicio con este nombre no fue encontrado.',
      );
    }

    if (service.quote) {
      throw new BadRequestException(
        'No se puede eliminar un servicio que ya tiene una cotización.',
      );
    }
    //
    event.services.pull({ name: serviceName });

    return event.save();
  }

  async updateService(
    eventId: string,
    serviceName: string,
    dto: Partial<AddServiceDto>,
  ): Promise<EventDocument> {
    const event = await this.eventModel.findOne({ eventId: eventId });

    if (!event) {
      throw new BadRequestException('El evento no existe.');
    }

    const serviceToUpdate = event.services.find((s) => s.name === serviceName);
    if (!serviceToUpdate) {
      throw new NotFoundException(
        'El servicio con este nombre no fue encontrado.',
      );
    }

    if (serviceToUpdate.quote) {
      throw new BadRequestException(
        'No se puede modificar un servicio que ya tiene una cotización.',
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
      throw new NotFoundException(
        'El servicio con este nombre no fue encontrado.',
      );
    }

    if (service.quote) {
      throw new BadRequestException('El servicio ya tiene una cotización.');
    }

    service.quote = quoteDto;
    return event.save();
  }
}
