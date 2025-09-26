import { Controller, Get, Post, Body, Param, Put, Patch } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Event } from './event.document';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@ApiTags('Events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiBearerAuth()
  @Post()
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Crear un nuevo evento' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: 201,
    description: 'Evento creado correctamente',
    type: Event,
  })
  async create(@Body() createEventDto: CreateEventDto) {
    return await this.eventService.create(createEventDto);
  }

  @ApiBearerAuth()
  @Get()
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Listar todos los eventos' })
  @ApiResponse({ status: 200, description: 'Lista de eventos', type: [Event] })
  async findAll() {
    return await this.eventService.findAll();
  }

  @ApiBearerAuth()
  @Put(':eventId')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Modificar un evento' })
  @ApiParam({ name: 'eventId', type: String, description: 'ID del evento' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({ status: 200, description: 'Evento actualizado', type: Event })
  async update(
    @Param('eventId') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return await this.eventService.update(id, updateEventDto);
  }

  @ApiBearerAuth()
  @Patch(':eventId/finalize')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Finalizar un evento' })
  @ApiParam({ name: 'eventId', type: String, description: 'ID del evento' })
  @ApiResponse({ status: 200, description: 'Evento finalizado', type: Event })
  async finalize(@Param('eventId') id: string) {
    return await this.eventService.finalize(id);
  }

  /*@Get(':id/providers')
  @ApiOperation({ summary: 'Listar proveedores (usuarios con rol proveedor) asociados a un evento' })
  @ApiParam({ name: 'id', type: String, description: 'ID del evento' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios que son proveedores para este evento',
    type: [User],
  })
  async getProviders(@Param('id') id: string) {
    return await this.eventService.getProviders(id);
  }*/
}
