import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User_Type } from 'src/user_type/user_type.entity';
import { Role } from 'src/auth/roles.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(User_Type)
    private usertypeRepo: Repository<User_Type>,
  ) {}

  async create(dto: CreateUserDto, requesterRole?: Role) {
    if (!dto) throw new ConflictException('No data provided');

    const birthDate = new Date(dto.birthDate);
    if (isNaN(birthDate.getTime()))
      throw new ConflictException('Invalid birthDate');

    const age =
      new Date(Date.now() - birthDate.getTime()).getUTCFullYear() - 1970;
    if (age < 18)
      throw new ConflictException('User must be at least 18 years old');

    const emailExists = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (emailExists) throw new ConflictException('Email already registered');

    const phoneExists = await this.userRepo.findOne({
      where: { telephone: dto.telephone },
    });
    if (phoneExists)
      throw new ConflictException('Telephone already registered');

    const typeUser = await this.getTypeUser(dto.user_Typeid);

    if (
      typeUser.name.toLowerCase() === Role.Admin.toLowerCase() &&
      requesterRole?.toLowerCase() !== Role.Admin.toLowerCase()
    ) {
      throw new ConflictException('Only an admin can register another admin');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 8);

    const user = this.userRepo.create({
      ...dto,
      birthDate,
      password: hashedPassword,
      typeuser: typeUser,
    });

    const saved = await this.userRepo.save(user);

    const { password: _password, ...rest } = saved;
    return rest;
  }

  async findAll() {
    const users = await this.userRepo.find({ relations: ['typeuser'] });
    return users.map(({ password: _password, ...rest }) => rest);
  }

  async findById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['typeuser'],
    });
    if (!user) throw new NotFoundException('User not found');

    const { password: _password, ...rest } = user;
    return rest;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['typeuser'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updates: Partial<User> = { ...dto };
    if (dto.password) updates.password = await bcrypt.hash(dto.password, 8);

    await this.userRepo.update(id, updates);

    const updated = await this.userRepo.findOne({
      where: { id },
      relations: ['typeuser'],
    });
    if (!updated) throw new NotFoundException('Updated user not found');

    const { password: _password, ...rest } = updated;
    return rest;
  }

  async delete(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.remove(user);
    return { message: 'User deleted successfully' };
  }

  async getTypeUser(id: number): Promise<User_Type> {
    const typeUser = await this.usertypeRepo.findOne({ where: { id } });
    if (!typeUser) throw new NotFoundException('User type not found');
    return typeUser;
  }
}
