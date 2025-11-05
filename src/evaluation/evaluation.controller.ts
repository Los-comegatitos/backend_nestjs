import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { EvaluationService } from './evaluation.service';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';

@ApiTags('Evaluations')
@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  @Post(':eventId/providers/:providerId/evaluation')
  @Roles(Role.Organizer)
  @ApiOperation({ summary: 'Calificar un proveedor de un evento finalizado' })
  @ApiParam({ name: 'eventId', example: '2111111112112' })
  @ApiParam({ name: 'providerId', example: '83' })
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
  async create(
    @Param('eventId') eventId: string,
    @Param('providerId') providerId: string,
    @Body() dto: CreateEvaluationDto,
  ) {
    return this.evaluationService.create({
      ...dto,
      eventId,
      providerId,
    });
  }

  @Get('providers/:providerId/average')
  @Roles(Role.Organizer, Role.Provider, Role.Admin)
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

  @Patch(':eventId/providers/:providerId/evaluation')
  @Roles(Role.Organizer)
  async updateEvaluation(
    @Param('eventId') eventId: string,
    @Param('providerId') providerId: string,
    @Body('organizerUserId') organizerUserId: string,
    @Body('score') score: number,
  ) {
    const evaluation = await this.evaluationService.updateEvaluation(
      eventId,
      providerId,
      organizerUserId,
      score,
    );
    return evaluation;
  }

  @Get(':eventId/providers/:providerId/evaluation')
  @Roles(Role.Organizer, Role.Provider)
  async getEvaluation(
    @Param('eventId') eventId: string,
    @Param('providerId') providerId: string,
  ) {
    const evaluation = await this.evaluationService.getEvaluation(
      eventId,
      providerId,
    );
    if (!evaluation) return { providerId, score: 0 };
    return evaluation;
  }
}
