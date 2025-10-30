import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quote, QuoteDocument, Service } from './quote.document';
import { QuoteDto } from './quote.dto';
import { ServiceTypeService } from 'src/service_type/service_type.service';
import { EventService } from 'src/event/event.service';
import { NotificationService } from 'src/notification/notification.service';
import { Notification_type } from 'src/notification/notification.enum';
import { UserService } from 'src/user/user.service';

@Injectable()
export class QuoteService {
  constructor(
    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,
    private readonly serviceTypeService: ServiceTypeService,
    @Inject(forwardRef(() => EventService))
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService,
    private readonly userService: UserService,
  ) {}

  async findAmount(): Promise<number> {
    return await this.quoteModel.countDocuments().exec();
  }

  async getPendingQuotesByOrganizer(organizerId: number) {
    const quotes = await this.quoteModel
      .find({ status: 'pending', 'event.organizerId': organizerId })
      .sort({ date: -1 })
      .lean();

    const grouped: Record<string, Array<any>> = {};

    for (const quoteBasic of quotes) {
      const quote = quoteBasic as Quote & {
        service?: Service | Service[];
        event?:
          | { name?: string; organizerId?: number }
          | { name?: string; organizerId?: number }[];
      };

      const serviceData = Array.isArray(quote.service)
        ? quote.service[0]
        : quote.service;
      const eventData = Array.isArray(quote.event)
        ? quote.event[0]
        : quote.event;

      const serviceTypeIdNum = parseInt(serviceData?.serviceTypeId ?? '', 10);
      if (isNaN(serviceTypeIdNum)) continue;

      const serviceInfo =
        await this.serviceTypeService.findOne(serviceTypeIdNum);
      const serviceName = serviceData?.name ?? 'Unknown service';
      const eventName = eventData?.name ?? 'Unnamed event';
      const key = serviceInfo?.name ?? 'Unknown service type';

      // se usa para obtener el nombre del proveedor osea firstName
      /*let providerName = 'Desconocido';
      try {
        const provider = await this.userService.findById(quote.providerId);
        if (provider) {
          providerName = provider.firstName;
          //console.log(`Proveedor encontrado: ${providerName} (ID: ${quote.providerId})`);
        } else {
          console.log(`Proveedor no encontrado para ID: ${quote.providerId}`);
        }
      } catch (error) {
        console.error(
          `Error al obtener proveedor con ID ${quote.providerId}:`,
          error,
        );
      }*/

      if (!grouped[key]) grouped[key] = [];

      const infoProvider = await this.userService.findById(quote.providerId);

      grouped[key].push({
        id: quote.id,
        name: serviceName,
        description: serviceData?.description,
        price: quote.price ?? 0,
        eventId: quote.eventId ?? 0,
        eventName,
        date: quote.date ?? new Date(),
        quantity: quote.quantity ?? 0,
        provider: infoProvider,
        status: quote.status ?? 'pending',
      });
    }

    return grouped;
  }

  async getPendingQuotesByEvent(organizerId: number, eventId: number) {
    const quotes = await this.quoteModel
      .find({ status: 'pending', eventId })
      .sort({ date: -1 })
      .lean();

    // if (!quotes.length) {
    //   throw new NotFoundException('No se encontraron cotizaciones para este evento');
    // }

    const grouped: Record<string, Array<any>> = {};

    for (const quoteBasic of quotes) {
      const quote = quoteBasic as Quote & {
        service?: Service | Service[];
        event?:
          | { name?: string; organizerId?: number }
          | { name?: string; organizerId?: number }[];
      };

      const serviceData = Array.isArray(quote.service)
        ? quote.service[0]
        : quote.service;
      const eventData = Array.isArray(quote.event)
        ? quote.event[0]
        : quote.event;

      if (!eventData || eventData.organizerId !== organizerId) continue;

      const serviceTypeIdNum = parseInt(serviceData?.serviceTypeId ?? '', 10);
      if (isNaN(serviceTypeIdNum)) continue;

      const serviceInfo =
        await this.serviceTypeService.findOne(serviceTypeIdNum);
      const serviceName = serviceData?.name ?? 'Unknown service';
      const eventName = eventData?.name ?? 'Unnamed event';
      const key = serviceInfo?.name ?? 'Unknown service type';

      if (!grouped[key]) grouped[key] = [];

      grouped[key].push({
        id: quote.id,
        name: serviceName,
        price: quote.price ?? 0,
        eventId: quote.eventId ?? 0,
        eventName,
        date: quote.date ?? new Date(),
        quantity: quote.quantity ?? 0,
      });
    }

    return grouped;
  }

  async sendQuotes(body: QuoteDto, userId: number, email: string) {
    const serviceTypeIdNum = parseInt(body.service.serviceTypeId, 10);
    if (isNaN(serviceTypeIdNum)) return; // lo que hare sera lo siguinete omitir quotes invalidas

    const eventType = await this.serviceTypeService.findOne(serviceTypeIdNum);
    if (!eventType) return;

    const event = await this.eventService.findByStringId(body.eventId);
    if (!event) return;

    const id = (await this.findAmount()) + 1;

    const newQuote = new this.quoteModel({
      ...body,
      providerId: userId,
      date: new Date(),
      status: 'pending',
      id,
      event: {
        organizerId: event.organizerUserId,
        name: event.name,
      },
    });

    const organizer = await this.userService.findById(
      parseInt(event.organizerUserId),
    );

    await newQuote.save();

    await this.notificationService.sendEmail({
      emails: [email],
      route: `"${body.service.name}" del evento "${event.name}"`,
      type: Notification_type.quote_sent,
      url: `/supplier_quotes`,
    });

    await this.notificationService.sendEmail({
      emails: [organizer.email],
      route: `servicio "${newQuote.service.name}" en el evento "${newQuote.event.name}"`,
      type: Notification_type.quote_received,
      url: `/event/${event.eventId}`,
    });
  }

  async getSentQuotesByProvider(providerId: number, status?: string) {
    const filter: Partial<Quote> & { providerId: number; status?: string } = {
      providerId,
    };
    if (status) filter.status = status;

    const quotes = await this.quoteModel.find(filter).sort({ date: -1 }).lean();
    // if (!quotes.length) throw new NotFoundException('No sent quotes found');
    if (!quotes.length) return [];

    const grouped: Record<string, Array<any>> = {};

    for (const quoteBasic of quotes) {
      const quote = quoteBasic as Quote & {
        service?: Service | Service[];
        event?: { name?: string } | { name?: string }[];
      };

      const serviceData = Array.isArray(quote.service)
        ? quote.service[0]
        : quote.service;
      const eventData = Array.isArray(quote.event)
        ? quote.event[0]
        : quote.event;

      const serviceTypeIdNum = parseInt(serviceData?.serviceTypeId ?? '', 10);
      if (isNaN(serviceTypeIdNum)) continue;

      const serviceInfo =
        await this.serviceTypeService.findOne(serviceTypeIdNum);
      const serviceName = serviceData?.name ?? 'Unknown service';
      const eventName = eventData?.name ?? 'Unnamed event';
      const key = serviceInfo?.name ?? 'Unknown service type';

      if (!grouped[key]) grouped[key] = [];

      grouped[key].push({
        id: quote.id,
        name: serviceName,
        price: quote.price ?? 0,
        eventId: quote.eventId ?? 0,
        eventName,
        status: quote.status ?? 'pending',
        date: quote.date ?? new Date(),
        quantity: quote.quantity ?? 0,
      });
    }

    return grouped;
  }

  async acceptQuote(id: number) {
    const quote = await this.quoteModel.findOne({ id: id });
    // console.log(quote);

    if (!quote) throw new NotFoundException('La cotización no fue encontrada');
    quote.status = 'accepted';
    await quote.save();
    const newInfo = {
      serviceTypeId: quote.service?.serviceTypeId,
      price: quote.price,
      quantity: quote.quantity,
      providerId: quote.providerId?.toString(),
      date: quote.date,
    };

    await this.eventService.addQuote(
      quote.eventId.toString(),
      quote.toServiceId,
      newInfo,
    );

    const provider = await this.userService.findById(
      parseInt(newInfo.providerId),
    );

    await this.notificationService.sendEmail({
      emails: [provider.email],
      route: `"${quote.service.name}" del evento "${quote.event.name}"`,
      type: Notification_type.quote_accepted,
      url: `/supplier_quotes`,
    });

    return {
      message: 'La cotización fue aceptada exitosamente',
      data: quote,
    };
  }

  async rejectQuote(id: number) {
    const quote = await this.quoteModel.findOne({ id: id });
    if (!quote) throw new NotFoundException('La cotización no fue encontrada');
    quote.status = 'rejected';
    const info = await quote.save();
    return {
      message: 'La cotización fue rechazada exitosamente',
      data: info,
    };
  }

  // reporte porcentaje aceptado
  async getAcceptedQuotesPercentage(providerId: number): Promise<string> {
    const total = await this.quoteModel.countDocuments({
      providerId: providerId,
    });
    if (total === 0) return '0%';

    const accepted = await this.quoteModel.countDocuments({
      status: 'accepted',
      providerId: providerId,
    });

    const percentage = ((accepted / total) * 100).toFixed(1) + '%';

    return percentage;
  }

  // reporte tipo servicio mas frecuente en las cotizaciones enviadas
  async getServiceTypeStats(
    providerId: number,
  ): Promise<{ type: string; count: number }[]> {
    const quotes = await this.quoteModel.find({
      providerId: providerId,
    });

    const counts: Record<string, number> = {};
    for (const quote of quotes) {
      const typeId = quote.service.serviceTypeId || 'sin_tipo';
      counts[typeId] = (counts[typeId] || 0) + 1;
    }

    // obtener nombres solo una vez por id
    const ids = Object.keys(counts).filter((id) => id !== 'sin_tipo');
    const idToName: Record<string, string> = {};

    for (const id of ids) {
      try {
        const type = await this.serviceTypeService.findOne(Number(id));
        idToName[id] = type?.name || `Tipo ${id}`;
      } catch {
        idToName[id] = 'Desconocido';
      }
    }

    return Object.entries(counts).map(([id, count]) => ({
      type: id === 'sin_tipo' ? 'Sin tipo' : idToName[id] || 'Desconocido',
      count,
    }));
  }

  async findQuoteUsingService(
    serviceName: string,
    providerId: number,
  ): Promise<Quote | null> {
    return await this.quoteModel
      .findOne({ 'service.name': serviceName, providerId: providerId })
      .exec();
  }
}
