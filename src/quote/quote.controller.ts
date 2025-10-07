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
import { Request as ExpressRequest } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('quote')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Get('received')
  @Roles(Role.Organizer)
  async getReceivedQuotes(
    @Req() req: ExpressRequest,
    @Query('eventId') eventId?: string,
  ) {
    const user = req.user as { userId: number; role: Role; email: string };
    const organizerId = user.userId;

    if (eventId) {
      return this.quoteService.getPendingQuotesByEvent(
        organizerId,
        Number(eventId),
      );
    }

    return this.quoteService.getPendingQuotesByOrganizer(organizerId);
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
    const user = req.user as { userId: number; role: Role; email: string };
    return this.quoteService.sendQuotes(createQuote, user.userId);
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
