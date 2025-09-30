import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User_Type } from './user_type.entity';
import { CreateUserTypeDto } from './dto/create-user_type.dto';
import { UpdateUserTypeDto } from './dto/update-user_type.dto';

@Injectable()
export class UserTypeService {
  constructor(
    @InjectRepository(User_Type)
    private userTypeRepository: Repository<User_Type>,
  ) {}

  async create(dto: CreateUserTypeDto): Promise<User_Type> {
    const existing = await this.userTypeRepository.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException(
        `El tipo de usuario con el nombre "${dto.name}" ya existe`,
      );
    }

    const newType = this.userTypeRepository.create(dto);
    return this.userTypeRepository.save(newType);
  }

  async findAll(): Promise<User_Type[]> {
    return this.userTypeRepository.find();
  }

  async update(id: number, dto: UpdateUserTypeDto): Promise<User_Type> {
    const typeuser = await this.userTypeRepository.findOne({ where: { id } });
    if (!typeuser) {
      throw new NotFoundException('El tipo de usuario no fue encontrado');
    }

    if (dto.name && dto.name !== typeuser.name) {
      const existing = await this.userTypeRepository.findOne({
        where: { name: dto.name },
      });
      if (existing) {
        throw new BadRequestException(
          `El tipo de usuario con el nombre "${dto.name}" ya existe`,
        );
      }
    }

    Object.assign(typeuser, dto);
    return this.userTypeRepository.save(typeuser);
  }
}
