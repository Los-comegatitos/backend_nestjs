import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceType } from './service_type.entity';
import { Repository } from 'typeorm';
import { CreateServiceTypeDto } from './dto/create-service_type.dto';
import { UpdateServiceTypeDto } from './dto/update-service_type.dto';

@Injectable()
export class ServiceTypeService {
  constructor(
    @InjectRepository(ServiceType)
    private readonly serviceTypeRepository: Repository<ServiceType>,
  ) {}

  async create(dto: CreateServiceTypeDto): Promise<ServiceType> {
    const exists = await this.serviceTypeRepository.findOne({
      where: { name: dto.name },
    });
    if (exists) {
      throw new BadRequestException(
        `El tipo de servicio con el nombre "${dto.name}" ya existe`,
      );
    }

    const newType = this.serviceTypeRepository.create(dto);
    return this.serviceTypeRepository.save(newType);
  }

  async findAll(): Promise<ServiceType[]> {
    return this.serviceTypeRepository.find();
  }

  async findAmount() {
    return this.serviceTypeRepository.count();
  }

  async findOneByName(name: string) {
    const servicetype = await this.serviceTypeRepository.findOneBy({ name });
    if (!servicetype)
      throw new NotFoundException('El tipo de servicio no fue encontrado');
    return servicetype;
  }

  async findOne(id: number): Promise<ServiceType> {
    const servicetype = await this.serviceTypeRepository.findOne({
      where: { id },
    });
    if (!servicetype)
      throw new NotFoundException('El tipo de servicio no fue encontrado');
    return servicetype;
  }

  async update(id: number, dto: UpdateServiceTypeDto): Promise<ServiceType> {
    const servicetype = await this.findOne(id);

    if (dto.name && dto.name !== servicetype.name) {
      const exists = await this.serviceTypeRepository.findOne({
        where: { name: dto.name },
      });
      if (exists) {
        throw new BadRequestException(
          `Un tipo de servicio con el nombre "${dto.name}" ya existe`,
        );
      }
    }

    Object.assign(servicetype, dto);
    return this.serviceTypeRepository.save(servicetype);
  }

  async remove(id: number): Promise<{ message: string }> {
    const typeservice = await this.findOne(id);
    await this.serviceTypeRepository.remove(typeservice);
    return { message: 'El tipo de servicio fue eliminado exitosamente' };
  }
}
