// import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
// import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
// import { RolesGuard } from 'src/auth/roles.guard';
// import { Roles } from 'src/auth/roles.decorator';
// import { Role } from 'src/auth/roles.enum';
// import { QuoteService } from './quote.service';
// import { FilterSentQuotesDto } from './dto/filter-sent-quotes.dto';

import { Controller } from '@nestjs/common';

// interface RequestWithUser extends Request {
//   user: { userId: number; role: Role; email: string };
// }
@Controller('quote')
export class QuoteController {}

// @UseGuards(JwtAuthGuard, RolesGuard)
// export class QuoteController {
//   constructor(private readonly quoteService: QuoteService) {}

//   @Get('received')
//   @Roles(Role.Organizer)
//   async getReceivedQuotes(@Request() req: RequestWithUser) {
//     const organizerId = req.user.userId;

//     console.log('JWT organizerId:', organizerId);

//     const quotes =
//       await this.quoteService.getPendingQuotesByOrganizer(organizerId);

//     console.log('Quotes received:', quotes);

//     return quotes;
//   }

//   @Get('sent')
//   @Roles(Role.Provider)
//   async getSentQuotes(
//     @Request() req: RequestWithUser,
//     @Query() filter: FilterSentQuotesDto,
//   ) {
//     const providerId = req.user.userId;

//     console.log('JWT providerId:', providerId);
//     console.log('Query status:', filter.status);

//     const quotes = await this.quoteService.getQuotesSentByProvider(
//       providerId,
//       filter.status,
//     );

//     console.log('Quotes found:', quotes);
//     return quotes;
//   }

//   @Get('test')
//   async testAllQuotes() {
//     return this.quoteService.testFindAll();
//   }
// }
