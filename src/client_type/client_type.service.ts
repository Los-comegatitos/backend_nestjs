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

  async findOneByName(name: string) {
    const typeclient = await this.clientTypeRepo.findOneBy({ name });
    if (!typeclient) throw new NotFoundException('client type not found');
    return typeclient;
  }

  async update(name: string , dto: UpdateClientTypeDto) {
    const typeclient = await this.findOneByName(name);
    Object.assign(typeclient, dto);
    return await this.clientTypeRepo.save(typeclient);
  }

  async remove(name: string) {
    const typeclient = await this.findOneByName(name);
    return await this.clientTypeRepo.remove(typeclient);
  }
}
