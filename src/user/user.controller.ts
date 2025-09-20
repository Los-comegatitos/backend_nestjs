import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
} from '@nestjs/common';

import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: User) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    if (!dto || dto.user_Typeid === undefined) {
      throw new ConflictException('Missing user type or body');
    }

    const typeUser = await this.userService.getTypeUser(dto.user_Typeid);

    if (typeUser.name.toLowerCase() === Role.Admin.toLowerCase()) {
      throw new ConflictException(
        'Cannot create an Admin from the public endpoint',
      );
    }

    return this.userService.create(dto);
  }


  @Post('admin')
  async createAdmin(@Body() dto: CreateUserDto, @Request() req) {
    const typeUser = await this.userService.getTypeUser(dto.user_Typeid);

    if (typeUser.name.toLowerCase() !== Role.Admin.toLowerCase()) {
      throw new ConflictException('Only Admin type can be created here');
    }

    return this.userService.create(dto, req.user.role);
  }


  @Get()
  async findAll() {
    return this.userService.findAll();
  }


  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }


  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }
}
