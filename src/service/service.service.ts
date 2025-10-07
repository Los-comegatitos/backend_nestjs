import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from 'src/event/event.document';

@Injectable()
export class ServiceService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  //Listar todos los proveedores de un evento
  async findProvidersByEvent(eventId: string) {
    const event = await this.eventModel.findOne({ eventId }).exec();

    if (!event) {
      throw new NotFoundException(`Evento con ID ${eventId} no encontrado`);
    }

    if (!event.services || event.services.length === 0) {
      return {
        message: {
          code: '000',
          description: 'El evento no tiene servicios registrados',
        },
        data: [],
      };
    }

    const providerIds = Array.from(
      new Set(
        event.services
          .map((s) => s.quote?.providerId) //Accede si quote existe
          .filter((id): id is string => !!id), // elimina los null
      ),
    );

    return {
      message: {
        code: '000',
        description: 'Proveedores obtenidos exitosamente',
      },
      data: providerIds,
    };
  }
}
