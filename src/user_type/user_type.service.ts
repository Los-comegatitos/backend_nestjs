
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserType } from './entities/user_type.entity';
import { CreateUserTypeDto } from './dto/create-user_type.dto';
import { UpdateUserTypeDto } from './dto/update-user_type.dto';

@Injectable()
export class UserTypeService {
  constructor(
    @InjectRepository(UserType)
    private userTypeRepository: Repository<UserType>,
  ) {}

  async create(dto: CreateUserTypeDto): Promise<UserType> {
    
    const existing = await this.userTypeRepository.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`UserType with name "${dto.name}" already exists`);
    }

    const newType = this.userTypeRepository.create(dto);
    return this.userTypeRepository.save(newType);
  }

  async findAll(): Promise<UserType[]> {
    return this.userTypeRepository.find();
  }

  async update(id: number, dto: UpdateUserTypeDto): Promise<UserType> {
    const type = await this.userTypeRepository.findOne({ where: { id } });
    if (!type) {
      throw new NotFoundException('UserType not found');
    }


    if (dto.name && dto.name !== type.name) {
      const existing = await this.userTypeRepository.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new BadRequestException(`UserType with name "${dto.name}" already exists`);
      }
    }

    Object.assign(type, dto);
    return this.userTypeRepository.save(type);
  }
}
