import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@ApiTags('Evaluaciones')
@Controller('evaluation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post()
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Calificar un proveedor' })
  @ApiBody({ type: CreateEvaluationDto })
  @ApiResponse({
    status: 201,
    description: 'Evaluación creada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Evento no finalizado o proveedor no participó',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no es organizador del evento',
  })
  @ApiResponse({
    status: 409,
    description: 'Ya se calificó al proveedor en este evento',
  })
  async create(@Body() dto: CreateEvaluationDto) {
    return this.evaluationService.create(dto);
  }

  @Get('average/:providerId')
  @ApiOperation({
    summary: 'Obtener el promedio de calificaciones de un proveedor',
  })
  @ApiParam({ name: 'providerId', example: '83' })
  @ApiResponse({
    status: 200,
    description: 'Promedio de calificación obtenido correctamente',
    schema: {
      example: { providerId: '83', average: 4.5 },
    },
  })
  async getProviderAverage(@Param('providerId') providerId: string) {
    const average = await this.evaluationService.getProviderAverage(providerId);
    return { providerId, average };
  }
}
