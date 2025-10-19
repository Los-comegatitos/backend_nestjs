import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evaluation, EvaluationDocument } from './evaluation.document';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';
import { Event, EventDocument } from 'src/event/event.document';

@Injectable()
export class EvaluationService {
  constructor(
    @InjectModel(Evaluation.name)
    private readonly evaluationModel: Model<EvaluationDocument>,

    @InjectModel(Event.name)
    private readonly eventModel: Model<EventDocument>,
  ) {}

  async create(dto: CreateEvaluationDto) {
    const { organizerUserId, providerId, eventId, score } = dto;

    const event = await this.eventModel.findOne({ eventId });
    if (!event) throw new NotFoundException('Evento no encontrado.');

    if (event.status !== 'finished') {
      throw new BadRequestException(
        'Solo puedes calificar cuando el evento ha finalizado.',
      );
    }

    if (event.organizerUserId !== organizerUserId) {
      throw new ForbiddenException(
        'No tienes permiso para calificar este evento.',
      );
    }

    const providerInTasks = Array.isArray(event.tasks)
      ? event.tasks.some((t) => t.associatedProviderId === providerId)
      : false;

    const providerInServices = Array.isArray(event.services)
      ? event.services.some((s) => s.quote?.providerId === providerId)
      : false;

    if (!providerInTasks && !providerInServices) {
      throw new BadRequestException(
        'El proveedor no participó en este evento.',
      );
    }

    const existing = await this.evaluationModel.findOne({
      organizerUserId,
      providerId,
      eventId,
    });
    if (existing) {
      throw new ConflictException(
        'Ya has calificado a este proveedor en este evento.',
      );
    }

    const evaluation = new this.evaluationModel({
      organizerUserId,
      providerId,
      eventId,
      score,
    });

    return evaluation.save();
  }

  async getProviderAverage(providerId: string) {
    const evaluations = await this.evaluationModel.find({ providerId });
    if (evaluations.length === 0) return 0;

    const avg =
      evaluations.reduce((acc, e) => acc + e.score, 0) / evaluations.length;

    return parseFloat(avg.toFixed(2));
  }

  async getEvaluation(eventId: string, providerId: string) {
    const evaluation = await this.evaluationModel.findOne({
      eventId,
      providerId,
    });

    if (!evaluation) {
      return null;
    }

    return {
      eventId: evaluation.eventId,
      providerId: evaluation.providerId,
      organizerUserId: evaluation.organizerUserId,
      score: evaluation.score,
    };
  }
  async updateEvaluation(
    eventId: string,
    providerId: string,
    organizerUserId: string,
    score: number,
  ) {
    const existing = await this.evaluationModel.findOne({
      eventId,
      providerId,
    });

    if (existing) {
      existing.score = score;
      return await existing.save();
    } else {
      const newEval = await this.evaluationModel.create({
        eventId,
        providerId,
        organizerUserId,
        score,
      });
      return newEval.save();
    }
  }
}
