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

  async findAmount() {
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

    const grouped: Record<
      string,
      Array<{
        id: number;
        name: string;
        description?: string;
        price: number;
        eventId: number;
        eventName?: string;
        date?: Date;
        quantity?: number;
        providerId?: number;
        status?: string;
      }>
    > = {};
    console.log(quotes);

    // le cambié a forof porque no me daban los await :'v

    for (const quoteBasic of quotes) {
      const quote = quoteBasic as Quote & {
        service?: Service;
        event?: { name?: string };
      };
      const serviceTypeId = quote.service?.serviceTypeId ?? 'unknown';
      const serviceName = quote.service?.name ?? 'Unknown service';
      const eventName = quote.event?.name ?? 'Unnamed event';

      console.log('UNICO');
      console.log(quote);
      const serviceInfo = await this.serviceTypeService.findOne(
        parseInt(serviceTypeId),
      );
      console.log(serviceInfo);

      if (!grouped[serviceInfo.name]) grouped[serviceInfo.name] = [];

      grouped[serviceInfo.name].push({
        id: quote.id,
        name: serviceName,
        description: quote.service?.description,
        price: quote.price,
        eventId: quote.eventId,
        eventName,
        date: quote.date,
        quantity: quote.quantity,
        providerId: quote.providerId,
        status: quote.status,
      });
    }

    // quotes.forEach(
    //   async (quote: Quote & { service?: Service; event?: { name?: string } }) => {
    //     const serviceTypeId = quote.service?.serviceTypeId ?? 'unknown';
    //     const serviceName = quote.service?.name ?? 'Unknown service';
    //     const eventName = quote.event?.name ?? 'Unnamed event';
    //     console.log('UNICO');

    //     // console.log(quote);

    //     // const serviceInfo = await this.serviceTypeService.findOne(parseInt(serviceTypeId));
    //     // console.log(serviceInfo);

    //     if (!grouped[serviceTypeId]) grouped[serviceTypeId] = [];

    //     grouped[serviceTypeId].push({
    //       id: quote.id,
    //       name: serviceName,
    //       description: quote.service?.description,
    //       price: quote.price,
    //       eventId: quote.eventId,
    //       eventName,
    //       date: quote.date,
    //       quantity: quote.quantity,
    //       providerId: quote.providerId,
    //       status: quote.status,
    //     });
    //   },
    // );

    console.log(grouped);

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

    const grouped: Record<
      string,
      Array<{
        id: number;
        name: string;
        price: number;
        eventId: number;
        eventName?: string;
        date?: Date;
        quantity?: number;
      }>
    > = {};

    quotes.forEach(
      (
        quote: Quote & {
          service?: Service;
          event?: { name?: string; organizerId?: number };
        },
      ) => {
        if (quote.event?.organizerId !== organizerId) return;

        const serviceTypeId = quote.service?.serviceTypeId ?? 'unknown';
        const serviceName = quote.service?.name ?? 'Unknown service';
        const eventName = quote.event?.name ?? 'Unnamed event';

        if (!grouped[serviceTypeId]) grouped[serviceTypeId] = [];

        grouped[serviceTypeId].push({
          id: quote.id,
          name: serviceName,
          price: quote.price,
          eventId: quote.eventId,
          eventName,
          date: quote.date,
          quantity: quote.quantity,
        });
      },
    );

    return grouped;
  }

  async sendQuotes(body: QuoteDto, userId: number) {
    const serviceTypeId = parseInt(body.service.serviceTypeId);
    const eventType = await this.serviceTypeService.findOne(serviceTypeId);

    if (!eventType) {
      throw new NotFoundException(
        `ServiceType con id ${serviceTypeId} no existe`,
      );
    }

    const eventId = body.eventId;
    const event = await this.eventService.findByStringId(eventId);

    if (!event) {
      throw new NotFoundException(`Event con id ${eventId} no existe`);
    }

    let id = await this.findAmount();
    id++;

    const info = {
      event: {
        organizerId: event.organizerUserId,
        name: event.name,
      },
    };

    const newData = {
      ...body,
      providerId: userId,
      date: new Date(),
      status: 'pending',
      id,
      ...info,
    };

    const newQuote = new this.quoteModel(newData);
    void newQuote.save();
  }

  async getSentQuotesByProvider(providerId: number, status?: string) {
    const filter: Partial<Quote> & { providerId: number; status?: string } = {
      providerId,
    };
    if (status) filter.status = status;

    const quotes = await this.quoteModel.find(filter).sort({ date: -1 }).lean();

    if (!quotes.length) {
      throw new NotFoundException('No sent quotes found');
    }

    const grouped: Record<
      string,
      Array<{
        id: number;
        name: string;
        price: number;
        eventId: number;
        eventName?: string;
        status: string;
        date?: Date;
        quantity?: number;
      }>
    > = {};

    quotes.forEach(
      (quote: Quote & { service?: Service; event?: { name?: string } }) => {
        const serviceTypeId = quote.service?.serviceTypeId ?? 'unknown';
        const serviceName = quote.service?.name ?? 'Unknown service';
        const eventName = quote.event?.name ?? 'Unnamed event';

        if (!grouped[serviceTypeId]) grouped[serviceTypeId] = [];

        grouped[serviceTypeId].push({
          id: quote.id,
          name: serviceName,
          price: quote.price,
          eventId: quote.eventId,
          eventName,
          status: quote.status,
          date: quote.date,
          quantity: quote.quantity,
        });
      },
    );

    return grouped;
  }
}
