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
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

import { User_Type } from 'src/user_type/user_type.entity';
import { Role } from 'src/auth/roles.enum';
import { CatalogService } from 'src/catalog/catalog.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(User_Type)
    private usertypeRepo: Repository<User_Type>,
    private readonly catalogService: CatalogService,
  ) {}

  async create(dto: CreateUserDto, requesterRole?: string) {
    if (!dto)
      throw new ConflictException('No se ha ingresado ninguna información');

    // const birthDate = new Date(dto.birthDate);
    // if (isNaN(birthDate.getTime()))
    //   throw new ConflictException('Fecha de nacimiento inválida');

    // const age =
    //   new Date(Date.now() - birthDate.getTime()).getUTCFullYear() - 1970;
    // if (age < 18)
    //   throw new ConflictException('El usuario debe tener al menos 18 años');

    const emailExists = await this.userRepo.findOne({
      where: { email: dto.email },
    });
    if (emailExists) throw new ConflictException('Email ya registrado');

    // const phoneExists = await this.userRepo.findOne({
    //   where: { telephone: dto.telephone },
    // });
    // if (phoneExists) throw new ConflictException('Teléfono ya registrado');

    const typeUser = await this.getTypeUser(dto.user_Typeid);

    if (
      typeUser.name.toLowerCase() === Role.Admin.toLowerCase() &&
      requesterRole?.toLowerCase() !== Role.Admin.toLowerCase()
    ) {
      throw new ConflictException('Solo un admin puede registrar otro admin');
    }

    const hashedPassword = await bcrypt.hash(
      Buffer.from(dto.password, 'base64').toString('utf-8'),
      10,
    );

    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
      typeuser: typeUser,
    });

    const saved = await this.userRepo.save(user);

    // Si se registró un provider, crearle su catálogo
    if (typeUser.name.toLowerCase() === Role.Provider.toLowerCase()) {
      const providerId = saved.id.toString();
      await this.catalogService.create(providerId);
    }

    // Si se registra un provider habrá que hacer lo de las calificaciones (a ver si es un doc aparte o en el catálogo)

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
    if (!user) throw new NotFoundException('El usuario no fue encontrado');

    const { password: _password, ...rest } = user;
    return rest;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['typeuser'],
    });
    if (!user) throw new NotFoundException('El usuario no fue encontrado');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('El usuario no fue encontrado');

    const updates: Partial<User> = { ...dto };
    if (dto.password) updates.password = await bcrypt.hash(dto.password, 10);

    await this.userRepo.update(id, updates);

    const updated = await this.userRepo.findOne({
      where: { id },
      relations: ['typeuser'],
    });
    if (!updated)
      throw new NotFoundException('El usuario actualizado no fue encontrado');

    const { password: _password, ...rest } = updated;
    return rest;
  }

  async updatePassword(id: number, dto: UpdateUserPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['typeuser'],
    });
    if (!user) throw new NotFoundException('El usuario no fue encontrado');

    if (user.typeuser.name.toLowerCase() === Role.Admin.toLowerCase())
      throw new ConflictException(
        'No se puede cambiar la contraseña a un administrador.',
      );

    const hashedPassword = await bcrypt.hash(
      Buffer.from(dto.password, 'base64').toString('utf-8'),
      10,
    );

    const userUpdated = this.userRepo.create({
      ...user,
      password: hashedPassword,
    });

    await this.userRepo.update(id, userUpdated);

    const updated = await this.userRepo.findOne({
      where: { id },
      relations: ['typeuser'],
    });
    if (!updated)
      throw new NotFoundException('El usuario actualizado no fue encontrado');

    return updated;
  }

  async delete(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('El usuario no fue encontrado');

    await this.userRepo.remove(user);
    return { message: 'El usuario fue eliminado exitosamente' };
  }

  async getTypeUser(id: number): Promise<User_Type> {
    const typeUser = await this.usertypeRepo.findOne({ where: { id } });
    if (!typeUser)
      throw new NotFoundException('El tipo de usuario no fue encontrado');
    return typeUser;
  }
}
