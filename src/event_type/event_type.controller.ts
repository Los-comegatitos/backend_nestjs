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
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('event-type')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventTypeController {
  constructor(private readonly service: EventTypeService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() dto: CreateEventTypeDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('/:name')
  @Roles(Role.Admin)
  async findOneByName(@Param('name') name: string) {
    return await this.service.findOneByName(name);
  }

  @Get(':id')
  @Roles(Role.Admin)
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(+id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  async update(@Param('id') id: string, @Body() dto: UpdateEventTypeDto) {
    return await this.service.update(+id, dto);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  async remove(@Param('id') id: string) {
    return await this.service.remove(+id);
  }
}
