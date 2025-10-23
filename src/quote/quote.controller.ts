import {
  Controller,
  Get,
  UseGuards,
  Param,
  Query,
  Post,
  Body,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { QuoteService } from './quote.service';
import { QuoteDto } from './quote.dto';
// no entiendo por qué hicieron la importación pero bueno aja, seguiré la estructura que hicieron en este controller xd
// no entiendo por qué hicieron la importación pero bueno aja, seguiré la estructura que hicieron en este controller xd
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserPayload } from 'src/auth/user-payload.type';

@ApiBearerAuth()
@Controller('quote')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get('accepted-quotes-percentage')
  @Roles(Role.Provider)
  async getAcceptedQuotesPercentage(@Req() datos: ExpressRequest) {
    const { userId } = datos.user as UserPayload;
    return await this.quoteService.getAcceptedQuotesPercentage(userId);
  }

  @Get('service-type-stats')
  @Roles(Role.Provider)
  async getServiceTypeStats(@Req() datos: ExpressRequest) {
    const { userId } = datos.user as UserPayload;
    return await this.quoteService.getServiceTypeStats(userId);
  }

  @Get('received')
  @Roles(Role.Organizer)
  async getReceivedQuotes(
    @Req() req: ExpressRequest,
    @Query('eventId') eventId?: string,
  ) {
    const { userId } = req.user as UserPayload;

    if (eventId) {
      return this.quoteService.getPendingQuotesByEvent(userId, Number(eventId));
    }

    return this.quoteService.getPendingQuotesByOrganizer(userId);
  }

  @Get('sent/:providerId')
  @Roles(Role.Provider)
  async getSentQuotes(
    @Param('providerId') providerId: string,
    @Query('status') status?: string,
  ) {
    return this.quoteService.getSentQuotesByProvider(
      Number(providerId),
      status,
    );
  }

  @Post('send')
  @Roles(Role.Provider)
  async sendQuotes(@Req() req: ExpressRequest, @Body() createQuote: QuoteDto) {
    const user = req.user as UserPayload;
    return this.quoteService.sendQuotes(createQuote, user.userId, user.email);
  }

  @Post(':quoteId/accept')
  @Roles(Role.Organizer)
  async acceptQuote(@Param('quoteId') quoteId: string) {
    return this.quoteService.acceptQuote(Number(quoteId));
  }

  @Post(':quoteId/reject')
  @Roles(Role.Organizer)
  async rejectQuote(@Param('quoteId') quoteId: string) {
    return this.quoteService.rejectQuote(Number(quoteId));
  }
}
