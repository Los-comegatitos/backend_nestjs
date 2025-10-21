import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Catalog, CatalogDocument } from './catalog.document';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { AddCatalogServiceDto } from './dto/add-catalog-service.dto';
import { ServiceTypeService } from 'src/service_type/service_type.service';
import { ServiceType } from 'src/service_type/service_type.entity';
import { QuoteService } from 'src/quote/quote.service';

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(Catalog.name) private catalogModel: Model<CatalogDocument>,
    private readonly serviceTypeService: ServiceTypeService,
    private readonly quoteService: QuoteService,
  ) {}

  async create(providerId: string) {
    const existingCatalog = await this.catalogModel
      .findOne({ providerId })
      .exec();

    if (existingCatalog) {
      throw new BadRequestException(
        `El catálogo para el proveedor ${providerId} ya existe.`,
      );
    }

    const newCatalog = new this.catalogModel({
      providerId,
      description: '',
      services: [],
    });

    return newCatalog.save();
  }

  async findCatalogUsingServiceType(
    serviceTypeId: string,
  ): Promise<Catalog | null> {
    return await this.catalogModel
      .findOne({ 'services.serviceTypeId': serviceTypeId })
      .exec();
  }

  async findByProviderId(providerId: string): Promise<CatalogDocument> {
    const catalog = await this.catalogModel.findOne({ providerId }).exec();
    if (!catalog) {
      throw new NotFoundException(
        `El catálogo para el proveedor ${providerId} no fue encontrado.`,
      );
    }
    return catalog;
  }

  async findCatalogByProviderId(
    providerId: number,
  ): Promise<{ catalog: CatalogDocument; serviceTypes: ServiceType[] }> {
    const providerIdString = providerId.toString();

    const catalog = await this.findByProviderId(providerIdString);

    const serviceTypes = await this.listUsedServiceTypes(providerIdString);

    return { catalog, serviceTypes };
  }

  async updateDescription(
    providerId: number,
    dto: UpdateCatalogDto,
  ): Promise<CatalogDocument> {
    const providerIdString = providerId.toString();
    const catalog = await this.findByProviderId(providerIdString);
    catalog.description = dto.description;
    return catalog.save();
  }

  async addService(
    providerId: number,
    dto: AddCatalogServiceDto,
  ): Promise<CatalogDocument> {
    const providerIdString = providerId.toString();
    const catalog = await this.findByProviderId(providerIdString);
    const serviceExists = catalog.services.some((s) => s.name === dto.name);

    if (serviceExists) {
      throw new BadRequestException(
        'Ya existe un servicio con este nombre en el catálogo.',
      );
    }

    catalog.services.push(dto);
    return catalog.save();
  }

  async removeService(
    providerId: number,
    name: string,
  ): Promise<CatalogDocument> {
    const usedByQuote = await this.quoteService.findQuoteUsingService(
      name,
      providerId,
    );

    if (usedByQuote !== null) {
      throw new BadRequestException(
        'Este servicio no puede ser eliminado porque ya se cotizó en una o más cotizaciones.',
      );
    }

    const providerIdString = providerId.toString();
    const catalog = await this.findByProviderId(providerIdString);
    const initialLength = catalog.services.length;

    catalog.services = catalog.services.filter(
      (service) => service.name !== name,
    );

    // como es lista y tal, pues si no filtró nada evidentemente no se eliminó nada.
    if (catalog.services.length === initialLength) {
      throw new NotFoundException('El nombre del servicio no fue encontrado.');
    }

    return catalog.save();
  }

  async updateService(
    providerId: number,
    name: string,
    dto: Partial<AddCatalogServiceDto>,
  ): Promise<CatalogDocument> {
    const providerIdString = providerId.toString();
    const catalog = await this.findByProviderId(providerIdString);
    const serviceToUpdate = catalog.services.find((s) => s.name === name);

    if (!serviceToUpdate) {
      throw new NotFoundException(
        'El servicio con este nombre no fue encontrado.',
      );
    }
    const serviceExists = catalog.services.some((s) => s.name === dto.name);
    if (serviceExists) {
      throw new BadRequestException(
        'Ya existe un servicio con este nombre en el catálogo.',
      );
    }

    Object.assign(serviceToUpdate, dto);
    return catalog.save();
  }

  async listUsedServiceTypes(providerId: string): Promise<ServiceType[]> {
    const uniqueServiceTypeIds: string[] =
      await this.listUsedServiceTypesOnlyId(providerId);

    // Utilizar servicio de tipo para llenar la info
    // array de promises para luego utilizar promise.all
    const promises = uniqueServiceTypeIds.map((id) =>
      this.serviceTypeService.findOne(parseInt(id)),
    );

    const listTypeServices = await Promise.all(promises);

    return listTypeServices;
  }

  // retorna una array de solos los id de los tipos de servicios en el catálogo del proveedor.
  async listUsedServiceTypesOnlyId(providerId: string): Promise<string[]> {
    const catalog = await this.findByProviderId(providerId);
    if (!catalog.services || catalog.services.length === 0) {
      return [];
    }

    const serviceTypeIds = catalog.services.map(
      (service) => service.serviceTypeId,
    );

    // set para eliminar dublicados
    const uniqueServiceTypeIds: string[] = [...new Set(serviceTypeIds)];

    return uniqueServiceTypeIds;
  }
}
