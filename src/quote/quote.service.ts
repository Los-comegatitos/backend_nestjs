import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quote, QuoteDocument, Service } from './quote.document';
import { QuoteDto } from './quote.dto';
import { ServiceTypeService } from 'src/service_type/service_type.service';
import { EventService } from 'src/event/event.service';

@Injectable()
export class QuoteService {
  constructor(
    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly eventService: EventService,
  ) {}

  async findAmount(): Promise<number> {
    return await this.quoteModel.countDocuments().exec();
  }

  async getPendingQuotesByOrganizer(organizerId: number) {
    const quotes = await this.quoteModel
      .find({ status: 'pending', 'event.organizerId': organizerId })
      .sort({ date: -1 })
      .lean();

    if (!quotes.length) {
      throw new NotFoundException('No pending quotes found');
    }

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

      if (!grouped[key]) grouped[key] = [];

      grouped[key].push({
        id: quote.id,
        name: serviceName,
        description: serviceData?.description,
        price: quote.price ?? 0,
        eventId: quote.eventId ?? 0,
        eventName,
        date: quote.date ?? new Date(),
        quantity: quote.quantity ?? 0,
        providerId: quote.providerId ?? 0,
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

    if (!quotes.length) {
      throw new NotFoundException('No pending quotes found for this event');
    }

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

  async sendQuotes(body: QuoteDto, userId: number) {
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

    await newQuote.save();
  }

  async getSentQuotesByProvider(providerId: number, status?: string) {
    const filter: Partial<Quote> & { providerId: number; status?: string } = {
      providerId,
    };
    if (status) filter.status = status;

    const quotes = await this.quoteModel.find(filter).sort({ date: -1 }).lean();
    if (!quotes.length) throw new NotFoundException('No sent quotes found');

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
    const quote = await this.quoteModel.findOne({ id });
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
    return quote;
  }

  async rejectQuote(id: number) {
    const quote = await this.quoteModel.findOne({ id });
    if (!quote) throw new NotFoundException('La cotización no fue encontrada');

    quote.status = 'rejected';
    return await quote.save();
  }
}
