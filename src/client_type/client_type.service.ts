import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateClientTypeDto } from './dto/update-client_type.dto';
import { ClientType } from './client_type.entity';
import { CreateTypeClientDto } from './dto/create-client_type.dto';
import { EventService } from 'src/event/event.service';

@Injectable()
export class ClientTypeService {
  constructor(
    @InjectRepository(ClientType)
    private readonly clientTypeRepo: Repository<ClientType>,
    private readonly eventService: EventService,
  ) {}

  async create(dto: CreateTypeClientDto): Promise<ClientType> {
    const exists = await this.clientTypeRepo.findOne({
      where: { name: dto.name },
    });
    if (exists) {
      throw new BadRequestException(
        `El tipo de cliente con el nombre "${dto.name}" ya existe`,
      );
    }

    const newType = this.clientTypeRepo.create(dto);
    return this.clientTypeRepo.save(newType);
  }

  async findAll() {
    return await this.clientTypeRepo.find();
  }

  async findOneByName(name: string) {
    const typeclient = await this.clientTypeRepo.findOneBy({ name });
    if (!typeclient)
      throw new NotFoundException('No se encontró el tipo de cliente');
    return typeclient;
  }

  async findOne(id: number): Promise<ClientType> {
    const typeclient = await this.clientTypeRepo.findOne({ where: { id } });
    if (!typeclient)
      throw new NotFoundException('No se encontró el tipo de cliente');
    return typeclient;
  }

  async update(id: number, dto: UpdateClientTypeDto): Promise<ClientType> {
    const typeclient = await this.findOne(id);

    if (dto.name && dto.name !== typeclient.name) {
      const exists = await this.clientTypeRepo.findOne({
        where: { name: dto.name },
      });
      if (exists) {
        throw new BadRequestException(
          `El tipo de cliente con el nombre "${dto.name}" ya existe`,
        );
      }
    }

    Object.assign(typeclient, dto);
    return this.clientTypeRepo.save(typeclient);
  }

  async remove(id: number): Promise<{ message: string }> {
    const typeclient = await this.findOne(id);

    const usedByEvent = await this.eventService.findEventUsingClientType(id);

    if (usedByEvent !== null) {
      throw new BadRequestException(
        'Este tipo de cliente no puede ser eliminado porque está en uso',
      );
    }

    await this.clientTypeRepo.remove(typeclient);
    return { message: 'El tipo de cliente fue eliminado exitosamente' };
  }
}
