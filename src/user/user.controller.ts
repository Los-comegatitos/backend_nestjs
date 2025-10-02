import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  ConflictException,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

interface RequestUser {
  user: {
    id: number;
    email: string;
    role: Role;
  };
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    if (!dto || dto.user_Typeid === undefined) {
      throw new ConflictException(
        'Falta información del tipo de usuario o general',
      );
    }

    const typeUser = await this.userService.getTypeUser(dto.user_Typeid);

    if (typeUser.name.toLowerCase() === Role.Admin.toLowerCase()) {
      throw new ConflictException(
        'No se puede crear un Admin desde el endpoint público',
      );
    }

    return await this.userService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('admin')
  async createAdmin(@Body() dto: CreateUserDto, @Request() req: RequestUser) {
    const typeUser = await this.userService.getTypeUser(dto.user_Typeid);

    if (typeUser.name.toLowerCase() !== Role.Admin.toLowerCase()) {
      throw new ConflictException('Solo se puede crear un tipo Admin aquí');
    }

    return await this.userService.create(dto, req.user.role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async findAll() {
    return await this.userService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return await this.userService.findByEmail(email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(Role.Admin, Role.Provider, Role.Organizer)
  @Get('profile')
  async getProfile(@Request() req: RequestUser) {
    const email = req.user.email;
    const user = await this.userService.findByEmail(email);
    if (!user)
      throw new NotFoundException(
        `Los datos de tu usuario no fueron encontrados`,
      );
    return user;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (!user)
      throw new NotFoundException(`El usuario con ID ${id} no fue encontrado`);
    return user;
  }
}
