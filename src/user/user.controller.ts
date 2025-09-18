import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
//import { GlobalExceptionFilter } from 'src/filters/filter-exception';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { User } from './user.entity';

@Controller('user')
export class UserController {

  constructor(private readonly userService: UserService) {}


  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.create(dto);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async findAll() {
    return await this.userService.findAll();
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return await this.userService.findByEmail(email);
  }


}
