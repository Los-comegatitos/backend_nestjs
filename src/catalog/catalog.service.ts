import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Catalog, CatalogDocument } from './catalog.document';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { AddServiceDto } from './dto/add-service.dto';
import { ServiceTypeService } from 'src/service_type/service_type.service';
import { ServiceType } from 'src/service_type/service_type.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(Catalog.name) private catalogModel: Model<CatalogDocument>,
    private readonly serviceTypeService: ServiceTypeService,
  ) {}

  // create empty catalog porque es la única manera de crear que habrá
  // teóricamente llamar este servicio al crear usuario @Luna-Hazuki2006
  async create(providerId: string) {
    const existingCatalog = await this.catalogModel
      .findOne({ providerId })
      .exec();

    if (existingCatalog) {
      throw new BadRequestException(
        `Catalog for provider ${providerId} already exists.`,
      );
    }

    const newCatalog = new this.catalogModel({
      providerId,
      description: '',
      services: [],
    });

    return newCatalog.save();
  }

  async findByProviderId(providerId: string): Promise<CatalogDocument> {
    const catalog = await this.catalogModel.findOne({ providerId }).exec();
    if (!catalog) {
      throw new NotFoundException(
        `Catalog for provider ${providerId} not found.`,
      );
    }
    return catalog;
  }

  async findCatalogByProviderId(
    providerId: string,
  ): Promise<{ catalog: CatalogDocument; serviceTypes: ServiceType[] }> {
    const catalog = await this.findByProviderId(providerId);
    const serviceTypes = await this.listUsedServiceTypes(providerId);

    return { catalog, serviceTypes };
  }

  async updateDescription(
    providerId: string,
    dto: UpdateCatalogDto,
  ): Promise<CatalogDocument> {
    const catalog = await this.findByProviderId(providerId);
    catalog.description = dto.description;
    return catalog.save();
  }

  async addService(
    providerId: string,
    dto: AddServiceDto,
  ): Promise<CatalogDocument> {
    const catalog = await this.findByProviderId(providerId);
    const serviceExists = catalog.services.some((s) => s.name === dto.name);

    if (serviceExists) {
      throw new BadRequestException(
        'Service with this name already exists in the catalog.',
      );
    }

    catalog.services.push(dto);
    return catalog.save();
  }

  async removeService(
    providerId: string,
    name: string,
  ): Promise<CatalogDocument> {
    const catalog = await this.findByProviderId(providerId);
    const initialLength = catalog.services.length;

    catalog.services = catalog.services.filter(
      (service) => service.name !== name,
    );

    // como es lista y tal, pues si no filtró nada evidentemente no se eliminó nada.
    if (catalog.services.length === initialLength) {
      throw new NotFoundException('Service with this name not found.');
    }

    return catalog.save();
  }

  async updateService(
    providerId: string,
    name: string,
    dto: Partial<AddServiceDto>,
  ): Promise<CatalogDocument> {
    const catalog = await this.findByProviderId(providerId);
    const serviceToUpdate = catalog.services.find((s) => s.name === name);

    if (!serviceToUpdate) {
      throw new NotFoundException('Service with this name not found.');
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
