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


@Injectable()
export class UserService {

constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(User_Type)
    private usertypeRepo: Repository<User_Type>

  ) {}


  
  async findAll() {
    const users = await this.userRepo.find();
    return users.map(({ password, ...rest }) => rest);
  }

  async findById(id: number) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...rest } = user;
    return rest;
  }

 

  async findByEmail(email: string, options?: { relations?: string[] }) {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: options?.relations || [],
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }



  async create(dto: CreateUserDto) {
    const exists = await this.userRepo.findOneBy({ email: dto.email });
    if (exists) throw new ConflictException('The email is already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 8);
    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
      typeuser: { id: dto.user_Typeid } as User_Type,

    });

    const saved = await this.userRepo.save(user);
    const { password, ...rest } = saved;
    return rest;
  }


  async update(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    const updates: Partial<User> = { ...dto };

    if (dto.password) {
        updates.password = await bcrypt.hash(dto.password, 8);
    }

    await this.userRepo.update(id, updates);

    const updated = await this.userRepo.findOneBy({ id });
    if (!updated) throw new NotFoundException('Updated user not found');

    const { password, ...rest } = updated;
    return rest;
}







}
