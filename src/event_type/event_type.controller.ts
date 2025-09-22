import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { EventTypeService } from './event_type.service';
import { CreateEventTypeDto } from './dto/create-event_type.dto';
import { UpdateEventTypeDto } from './dto/update-event_type.dto';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@Controller('event-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventTypeController {
  constructor(private readonly eventTypeService: EventTypeService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() dto: CreateEventTypeDto) {
    return this.eventTypeService.create(dto);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.eventTypeService.findAll();
  }

  @Get(':id')
  @Roles(Role.Admin)
  findOne(@Param('id') id: string) {
    return this.eventTypeService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() dto: UpdateEventTypeDto) {
    return this.eventTypeService.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    return this.eventTypeService.remove(+id);
  }
}
