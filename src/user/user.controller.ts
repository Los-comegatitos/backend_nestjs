import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  ConflictException,
  Request,
  Put,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';

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
    const typeUser = await this.userService.getTypeUser(dto.user_Typeid);

    if (typeUser.name.toLowerCase() === Role.Admin.toLowerCase()) {
      throw new ConflictException(
        'No se puede crear un Admin desde el endpoint público',
      );
    }

    return await this.userService.create(dto);
  }

  @Get('/registered-users-count')
  @Roles(Role.Admin)
  async getRegisteredUsersCount() {
    return await this.userService.getRegisteredUsersCount();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('create-admin')
  async createAdmin(@Body() dto: CreateUserDto, @Request() datos: RequestUser) {
    const { role } = datos.user;
    return await this.userService.create(dto, role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('update-password/:id')
  async updatePassword(
    @Param('id') id: number,
    @Body() dto: UpdateUserPasswordDto,
  ) {
    return await this.userService.updatePassword(id, dto);
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
  @Get('profile')
  async getProfile(@Request() req: RequestUser) {
    const email = req.user.email;
    return await this.userService.getProfile(email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put('profile/:id')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return await this.userService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findById(id);
  }
}
