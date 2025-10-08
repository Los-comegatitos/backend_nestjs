import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceService } from './service.service';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@ApiTags('Service')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get('providers/:eventId')
  @ApiOperation({
    summary: 'Listar los proveedores asociados a los servicios de un evento',
  })
  async getProvidersByEvent(@Param('eventId') eventId: string) {
    return await this.serviceService.findProvidersByEvent(eventId);
  }
}
