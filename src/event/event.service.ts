import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventDocument } from './event.document';
import { Model } from 'mongoose';
import { CatalogService } from 'src/catalog/catalog.service';
import { FilteredEvent } from './event.interfaces';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly catalogService: CatalogService,
  ) {}

  async findEventsByServiceTypes(
    serviceTypeIds: string[],
  ): Promise<FilteredEvent[]> {
    const events: FilteredEvent[] = (await this.eventModel
      .aggregate([
        // match para eventos cuyos services.serviceTypeId hagan mach con alguno de los serviceTypeIds
        {
          $match: {
            'services.serviceTypeId': { $in: serviceTypeIds },
          },
        }, // devolver solo estos campos deseados
        {
          $project: {
            name: 1,
            description: 1,
            eventDate: 1,
            // Filtrar para solo mostrar services con el mismo serviceTypeId
            services: {
              $filter: {
                input: '$services',
                as: 'service',
                cond: { $in: ['$$service.serviceTypeId', serviceTypeIds] },
              },
            },
          },
        },
      ])
      .exec()) as FilteredEvent[];
    // as FilteredEvent porque es lo que describí en el project
    return events;
  }

  async findEventsForProvider(providerId: string): Promise<FilteredEvent[]> {
    const serviceTypesId: string[] =
      await this.catalogService.listUsedServiceTypesOnlyId(providerId);

    return await this.findEventsByServiceTypes(serviceTypesId);
  }
}
