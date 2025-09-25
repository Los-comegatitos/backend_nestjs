// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { Quote, QuoteDocument } from './quote.document';

// interface QuoteWithService extends Quote {
//   service: {
//     serviceTypeId?: number;
//     name?: string;
//     description?: string;
//   };
//   event: {
//     organizerId?: number;
//     name?: string;
//   };
// }
export class QuoteService {}
// @Injectable()
// export class QuoteService {
//   constructor(
//     @InjectModel(Quote.name)
//     private quoteModel: Model<QuoteDocument>,
//   ) {}

//   async getPendingQuotesByOrganizer(organizerId: number) {
//     const quotes = (await this.quoteModel
//       .find({ 'event.organizerId': organizerId, status: 'pending' })
//       .lean()) as QuoteWithService[];

//     if (!quotes.length) throw new NotFoundException('No pending quotes found');

//     const grouped: Record<
//       string,
//       { id: number; name: string; price: number; eventName?: string }[]
//     > = {};

//     quotes.forEach((quote) => {
//       const serviceType = String(quote.service?.serviceTypeId ?? 'unknown');

//       if (!grouped[serviceType]) grouped[serviceType] = [];

//       grouped[serviceType].push({
//         id: quote.id,
//         name: quote.service?.name ?? 'Unknown',
//         price: quote.price,
//         eventName: quote.event?.name ?? 'Unnamed event',
//       });
//     });

//     return grouped;
//   }

//   async getQuotesSentByProvider(
//     providerId: number,
//     status?: 'pending' | 'accepted' | 'rejected',
//   ) {
//     const filter: Partial<Quote> & { providerId: number } = { providerId };
//     if (status) filter.status = status;

//     const quotes = (await this.quoteModel
//       .find(filter)
//       .sort({ date: -1 })
//       .lean()) as QuoteWithService[];

//     if (!quotes.length) return { message: 'No quotes found' };

//     return quotes.map((q) => ({
//       id: q.id,
//       eventId: q.eventId,
//       eventName: q.event?.name ?? 'Unnamed event',
//       serviceName: q.service?.name ?? 'Unknown',
//       price: q.price,
//       status: q.status,
//       date: q.date,
//     }));
//   }

//   async testFindAll() {
//     const quotes = await this.quoteModel.find().lean();
//     console.log('All quotes:', quotes);
//     return quotes;
//   }
// }
