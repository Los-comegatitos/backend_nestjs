import {
  BadRequestException,
  forwardRef,
  Inject,
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
import { Quote, QuoteDocument } from 'src/quote/quote.document';
import { User } from 'src/user/user.entity';
import { In } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { NotificationService } from 'src/notification/notification.service';
import { Notification_type } from 'src/notification/notification.enum';
import { ClientTypeService } from 'src/client_type/client_type.service';

export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Quote.name) private readonly quoteModel: Model<QuoteDocument>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(EventType)
    private readonly eventTypeRepository: Repository<EventType>,
    private readonly catalogService: CatalogService,
    private readonly userService: UserService,
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => ClientTypeService))
    private readonly clientTypeService: ClientTypeService,
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
    const nextEventId = lastEvent ? `${parseInt(lastEvent.eventId) + 1}` : '1';

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

  async findEventUsingServiceType(
    serviceTypeId: string,
  ): Promise<Event | null> {
    return await this.eventModel
      .findOne({ 'services.serviceTypeId': serviceTypeId })
      .exec();
  }

  async findEventUsingEventType(eventTypeId: string): Promise<Event | null> {
    return await this.eventModel.findOne({ eventTypeId: eventTypeId }).exec();
  }

  async findEventUsingClientType(clientTypeId: number): Promise<Event | null> {
    return await this.eventModel
      .findOne({ 'client.clientTypeId': clientTypeId })
      .exec();
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

    let updateQuery: any = { ...updateEventDto };

    if (updateEventDto.client === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete updateQuery.client;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      updateQuery = {
        ...updateQuery,
        $unset: { client: '' },
      };
    }

    const updatedEvent = await this.eventModel.findOneAndUpdate(
      { eventId },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      updateQuery,
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

    const providers = await this.getAcceptedProvidersByEvent(eventId);

    const users = [...new Set(providers.map((e) => e.providerId))];

    if (users.length != 0) {
      const emails = await Promise.all(
        users.map(async (id) => {
          const info = await this.userService.findById(id);
          return info.email;
        }),
      );

      await this.notificationService.sendEmail({
        emails: emails,
        type: Notification_type.event_finished,
        route: event.name,
        url: `/events-providers`,
      });
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

    const providers = await this.getAcceptedProvidersByEvent(eventId);

    const users = [...new Set(providers.map((e) => e.providerId))];

    if (users.length != 0) {
      const emails = await Promise.all(
        users.map(async (id) => {
          const info = await this.userService.findById(id);
          return info.email;
        }),
      );

      await this.notificationService.sendEmail({
        emails: emails,
        type: Notification_type.event_cancelled,
        route: event.name,
        url: `/events-providers`,
      });
    }

    return event;
  }

  // async findEventsByServiceTypes(
  //   serviceTypeIds: string[],
  // ): Promise<FilteredEvent[]> {
  //   console.log('serviceTypeIds', serviceTypeIds);

  //   const events: FilteredEvent[] = (await this.eventModel
  //     .aggregate([
  //       {
  //         $project: {
  //           name: 1,
  //           description: 1,
  //           eventDate: 1,
  //           services: {
  //             $filter: {
  //               input: '$services',
  //               as: 'service',
  //               cond: {
  //                 $in: ['$$service.serviceTypeId', serviceTypeIds],
  //               },
  //             },
  //           },
  //         },
  //       },
  //       {
  //         $match: {
  //           'services.0': { $exists: true },
  //         },
  //       },
  //     ])
  //     .exec()) as FilteredEvent[];

  //   console.log('events', JSON.stringify(events, null, 2));

  //   return events;
  // }

  async deleteEvent(eventId: number, organizerId: number): Promise<Event> {
    const organizerIdString = organizerId.toString();

    const event = await this.eventModel.findOneAndDelete({
      eventId: eventId,
      organizerUserId: organizerIdString,
    });

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
        {
          $addFields: {
            services: {
              $filter: {
                input: '$services',
                as: 'service',
                cond: {
                  $and: [
                    { $in: ['$$service.serviceTypeId', serviceTypeIds] },
                    { $gte: ['$$service.dueDate', new Date()] },
                    { $eq: ['$$service.quote', null] },
                  ],
                },
              },
            },
          },
        },
        {
          $match: {
            $expr: { $gt: [{ $size: '$services' }, 0] },
          },
        },
        {
          $project: {
            eventId: 1,
            name: 1,
            description: 1,
            eventDate: 1,
            services: 1,
          },
        },
      ])
      .exec()) as FilteredEvent[];

    console.log('events', events);

    return events;
  }

  /*async findEventsByServiceTypesAndProvider(
    serviceTypeIds: string[],
    providerId?: string,
  ): Promise<FilteredEvent[]> {
    console.log(
      'serviceTypeIds',
      serviceTypeIds,
      'providerId',
      providerId || 'none',
    );

    const events: FilteredEvent[] = (await this.eventModel
      .aggregate([
        {
          $addFields: {
            services: {
              $filter: {
                input: '$services',
                as: 'service',
                cond: {
                  $and: [
                    { $in: ['$$service.serviceTypeId', serviceTypeIds] },
                    { $gte: ['$$service.dueDate', new Date()] },
                    ...(providerId
                      ? [
                          {
                            $or: [
                              { $eq: ['$$service.quote', null] },
                              {
                                $eq: ['$$service.quote.providerId', providerId],
                              },
                            ],
                          },
                        ]
                      : [{ $eq: ['$$service.quote', null] }]),
                  ],
                },
              },
            },
          },
        },
        {
          $match: {
            $expr: { $gt: [{ $size: '$services' }, 0] },
          },
        },
        {
          $project: {
            eventId: 1,
            name: 1,
            description: 1,
            eventDate: 1,
            services: 1,
          },
        },
      ])
      .exec()) as FilteredEvent[];

    console.log('events', events);
    return events;
  }*/

  async findEventsForProvider(providerId: number): Promise<FilteredEvent[]> {
    const providerIdString = providerId.toString();
    const serviceTypesId: string[] =
      await this.catalogService.listUsedServiceTypesOnlyId(providerIdString);

    return await this.findEventsByServiceTypes(serviceTypesId);
    //return await this.findEventsByServiceTypesAndProvider(serviceTypesId, providerIdString,);
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

  async findByStringId(eventId: string): Promise<EventDocument> {
    const event = await this.eventModel.findOne({ eventId: eventId }).exec();
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
      // organizerUserId: organizerIdString,
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

    const exists = event.services.some((s) => s.name === dto.name);
    if (exists) {
      throw new BadRequestException(
        'Un servicio con este nombre ya existe en el evento.',
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
    const event = await this.findByStringId(eventId);

    console.log(event);

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

  // listar proveedores con cotizaciones aprobadas
  async getAcceptedProvidersByEvent(eventId: number) {
    //filtrar pro cotización aceptada
    const quotes = await this.quoteModel
      .find({ eventId, status: 'accepted' })
      .lean()
      .exec();

    if (!quotes.length) {
      return [];
    }

    //vector de ids únicos de proveedores
    const providerIds = [...new Set(quotes.map((q) => q.providerId))];

    //buscar los datos de los proveedores en User
    const providers = await this.userRepository.find({
      where: { id: In(providerIds) },
      select: ['id', 'firstName', 'lastName'],
    });

    //construir respuesta combinando Quote + User
    const result = quotes.map((quote) => {
      const provider = providers.find((p) => p.id === quote.providerId);
      return {
        providerId: quote.providerId,
        providerName: provider
          ? `${provider.firstName} ${provider.lastName}`
          : `Proveedor #${quote.providerId}`,
        service: {
          serviceTypeId: quote.service?.serviceTypeId,
          name: quote.service?.name,
          description: quote.service?.description,
        },
      };
    });

    return result;
  }

  // Reporte 1: promedio finalización de tareas
  async getAverageTaskCompletionTime(organizerId: number): Promise<string> {
    const organizerIdString = organizerId.toString();
    const events = await this.eventModel
      .find({
        organizerUserId: organizerIdString,
        'tasks.status': 'completed',
      })
      .exec();

    let totalTime = 0;
    let completedCount = 0;

    for (const event of events) {
      for (const task of event.tasks) {
        if (
          task.status === 'completed' &&
          task.completionDate &&
          task.creationDate
        ) {
          const diferencia =
            new Date(task.completionDate).getTime() -
            new Date(task.creationDate).getTime();
          totalTime += diferencia;
          completedCount++;
        }
      }
    }

    if (completedCount === 0) return 'No hay tareas completadas.';

    const avgMs = totalTime / completedCount;
    const avgHours = avgMs / (1000 * 60 * 60);
    const days = Math.floor(avgHours / 24);
    const hours = Math.round(avgHours % 24);

    return `${days} días y ${hours} horas`;
  }

  // Reporte 2: clientes más frecuentes
  async getClientTypeStats(
    organizerId: number,
  ): Promise<{ type: string; count: number }[]> {
    const organizerIdString = organizerId.toString();

    const events = await this.eventModel
      .find({
        organizerUserId: organizerIdString,
      })
      .exec();

    const counts: Record<string, number> = {};

    for (const event of events) {
      const clientTypeId = event.client?.clientTypeId;
      // (counts[clientTypeId] || 0) por si ya está en el obj o no
      if (!clientTypeId) {
        counts['sin_cliente'] = (counts['sin_cliente'] || 0) + 1;
      } else {
        counts[clientTypeId] = (counts[clientTypeId] || 0) + 1;
      }
    }

    const clientTypeIds = Object.keys(counts).filter(
      (id) => id !== 'sin_cliente',
    );

    const idToNameMap: Record<string, string> = {};

    for (const id of clientTypeIds) {
      try {
        const type = await this.clientTypeService.findOne(Number(id));
        idToNameMap[id] = type?.name;
      } catch {
        // por si acaso
        idToNameMap[id] = 'Desconocido';
      }
    }
    const result = Object.entries(counts).map(([key, count]) => {
      let name: string;
      if (key === 'sin_cliente') name = 'Sin cliente';
      else name = idToNameMap[key] || 'Desconocido';

      return { type: name, count };
    });

    return result;
  }

  // reporte pie chart
  async getMostFrequentEventTypes(): Promise<
    { type: string; count: number }[]
  > {
    const events = await this.eventModel.find();

    const counts: Record<string, number> = {};

    for (const event of events) {
      const type = event.eventTypeId || 'Sin tipo';
      counts[type] = (counts[type] || 0) + 1;
    }

    // llenar con nombres en vez de id etc

    const ids = Object.keys(counts).filter((id) => id !== 'sin_tipo');

    const idToName: Record<string, string> = {};

    for (const id of ids) {
      try {
        const eventType = await this.eventTypeRepository.findOne({
          where: { id: Number(id) },
        });
        idToName[id] = eventType?.name || `Tipo ${id}`;
      } catch {
        idToName[id] = 'Desconocido';
      }
    }

    return Object.entries(counts).map(([id, count]) => ({
      type: id === 'sin_tipo' ? 'Sin tipo' : idToName[id] || 'Desconocido',
      count,
    }));
  }
}
