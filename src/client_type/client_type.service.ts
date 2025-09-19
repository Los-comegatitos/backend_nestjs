import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
//import { UpdateClientTypeDto } from './dto/update-client_type.dto';
import { Repository } from 'typeorm';
import { UpdateClientTypeDto } from './dto/update-client_type.dto';
import { ClientType } from './client_type.entity';

@Injectable()
export class ClientTypeService {
  constructor(
    @InjectRepository(ClientType)
    private readonly clientTypeRepo: Repository<ClientType>,
  ) {}

  async create(dto: Partial<ClientType>) {
    const typeclient = this.clientTypeRepo.create(dto);
    return await this.clientTypeRepo.save(typeclient);
  }

  async findAll() {
    return await this.clientTypeRepo.find();
  }

  async findOne(id: number) {
    const typeclient = await this.clientTypeRepo.findOneBy({ id });
    if (!typeclient) throw new NotFoundException('client type not found');
    return typeclient;
  }

  async update(id: number, dto: UpdateClientTypeDto) {
    const typeclient = await this.findOne(id);
    Object.assign(typeclient, dto);
    return await this.clientTypeRepo.save(typeclient);
  }

  async remove(id: number) {
    const typeclient = await this.findOne(id);
    return await this.clientTypeRepo.remove(typeclient);
  }
}
