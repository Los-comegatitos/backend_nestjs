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
  Delete,
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
import { AddServiceDto } from './dto/event-service.dto';
@ApiTags('Events')
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Roles(Role.Provider)
  @Get('for-providerr')
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

  @ApiBearerAuth()
  @Post()
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Crear un nuevo evento' })
  @ApiBody({ type: CreateEventDto })
  async create(@Body() createEventDto: CreateEventDto, @Req() datos: Request) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    const event = await this.eventService.create(createEventDto, userId);
    return event;
  }

  @ApiBearerAuth()
  @Get()
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Listar todos los eventos de un organizador' })
  async findAll(@Req() datos: Request): Promise<Event[]> {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    return await this.eventService.findAllOrganizer(userId);
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
  async finalize(@Param('eventId') id: string, @Req() datos: Request) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    const event = await this.eventService.finalize(Number(id), userId);
    return event;
  }

  @ApiBearerAuth()
  @Patch(':eventId/cancel')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Cancelar un evento' })
  @ApiParam({ name: 'eventId', type: Number, description: 'ID del evento' })
  async cancel(@Param('eventId') id: string, @Req() datos: Request) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    const event = await this.eventService.cancelEvent(Number(id), userId);
    return event;
  }

  @ApiBearerAuth()
  @Patch(':eventId/delete')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Eliminar un evento' })
  @ApiParam({ name: 'eventId', type: Number, description: 'ID del evento' })
  async delete(@Param('eventId') id: string, @Req() datos: Request) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    const event = await this.eventService.deleteEvent(Number(id), userId);
    return event;
  }

  @Roles(Role.Organizer)
  @Get(':eventId')
  @ApiOperation({
    summary:
      'Listar información de un evento (validando que sea de ese usuario))',
  })
  async findOneEvent(@Param('eventId') eventId: string, @Req() datos: Request) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    return await this.eventService.findByIdValidated(eventId, userId);
  }

  @Post(':eventId/services')
  @Roles(Role.Organizer)
  async addService(
    @Param('eventId') eventId: string,
    @Body() dto: AddServiceDto,
  ) {
    return await this.eventService.addService(eventId, dto);
  }

  @Patch(':eventId/services/:serviceName')
  @Roles(Role.Organizer)
  async updateService(
    @Param('eventId') eventId: string,
    @Param('serviceName') serviceName: string,
    @Body() dto: Partial<AddServiceDto>,
  ) {
    return await this.eventService.updateService(eventId, serviceName, dto);
  }

  @Delete(':eventId/services/:serviceName')
  @Roles(Role.Organizer)
  async removeService(
    @Param('eventId') eventId: string,
    @Param('serviceName') serviceName: string,
  ) {
    return await this.eventService.removeService(eventId, serviceName);
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
