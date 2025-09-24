import { Controller, Get, Param } from '@nestjs/common';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get('for-provider/:providerId')
  async findOneByProviderId(@Param('providerId') providerId: string) {
    return await this.eventService.findEventsForProvider(providerId);
  }
}
