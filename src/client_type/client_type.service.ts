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

@Injectable()
export class ClientTypeService {
  constructor(
    @InjectRepository(ClientType)
    private readonly clientTypeRepo: Repository<ClientType>,
  ) {}

  async create(dto: CreateTypeClientDto): Promise<ClientType> {
    const exists = await this.clientTypeRepo.findOne({
      where: { name: dto.name },
    });
    if (exists) {
      throw new BadRequestException(
        `Client type with name "${dto.name}" already exists`,
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
    if (!typeclient) throw new NotFoundException('Client type not found');
    return typeclient;
  }

  async findOne(id: number): Promise<ClientType> {
    const typeclient = await this.clientTypeRepo.findOne({ where: { id } });
    if (!typeclient) throw new NotFoundException('Client type not found');
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
          `Type Client with name "${dto.name}" already exists`,
        );
      }
    }

    Object.assign(typeclient, dto);
    return this.clientTypeRepo.save(typeclient);
  }

  async remove(id: number): Promise<{ message: string }> {
    const typeclient = await this.findOne(id);
    await this.clientTypeRepo.remove(typeclient);
    return { message: 'Client type deleted successfully' };
  }
}
