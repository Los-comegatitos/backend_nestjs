
import {
  Controller,
  Get,
  Request,
  UseGuards,
  Param,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { QuoteService } from './quote.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  /*@Get('received')
  @Roles(Role.Organizer)
  async getReceivedQuotes(
    @Request() req: { user: { userId: number; role: Role; email: string } },
  ) {
    const organizerId = req.user.userId;
    return this.quoteService.getPendingQuotesByOrganizer(organizerId);
  }
  */

  @Get('received/:eventId')
  @Roles(Role.Organizer)
  async getReceivedQuotesByEvent(
    @Request() req: { user: { userId: number; role: Role; email: string } },
    @Param('eventId') eventId: string,
  ) {
    const organizerId = req.user.userId;
    return this.quoteService.getPendingQuotesByEvent(
      organizerId,
      Number(eventId),
    );
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
}
