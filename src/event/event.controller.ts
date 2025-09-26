import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Request } from 'express';
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
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
@ApiTags('Events')
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
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
    const event = await this.eventService.create(createEventDto);
    return {
      message: '000',
      description: 'Evento creado correctamente',
      data: event,
    };
  }

  @ApiBearerAuth()
  @Get()
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Listar todos los eventos' })
  @ApiResponse({ status: 200, description: 'Lista de eventos', type: [Event] })
  async findAll(): Promise<Event[]> {
    // Devuelve un array directamente para que el frontend pueda hacer map
    return await this.eventService.findAll();
  }

  @ApiBearerAuth()
  @Put(':eventId')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Modificar un evento' })
  @ApiParam({ name: 'eventId', type: Number, description: 'ID del evento' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({ status: 200, description: 'Evento actualizado', type: Event })
  async update(
    @Param('eventId') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    const event = await this.eventService.update(Number(id), updateEventDto);
    return { message: '000', description: 'Evento actualizado', data: event };
  }

  @ApiBearerAuth()
  @Patch(':eventId/finalize')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Finalizar un evento' })
  @ApiParam({ name: 'eventId', type: Number, description: 'ID del evento' })
  @ApiResponse({ status: 200, description: 'Evento finalizado', type: Event })
  async finalize(@Param('eventId') id: string) {
    const event = await this.eventService.finalize(Number(id));
    return { message: '000', description: 'Evento finalizado', data: event };
  }

  @Roles(Role.Provider)
  @Get('for-provider')
  @ApiOperation({
    summary:
      'Listar los eventos para proveedores (según los requisitos necesarios para que sean mostrados)',
  })
  async findOneByProviderId(@Req() datos: Request) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    return await this.eventService.findEventsForProvider(userId);
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
