import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Quote, QuoteDocument, Service } from './quote.document';

@Injectable()
export class QuoteService {
  constructor(
    @InjectModel(Quote.name)
    private readonly quoteModel: Model<QuoteDocument>,
  ) {}

  /**async getPendingQuotesByOrganizer(organizerId: number) {
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
        price: number;
        eventId: number;
        eventName?: string;
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
          date: quote.date,
          quantity: quote.quantity,
        });
      },
    );

    return grouped;
  }
  */

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
