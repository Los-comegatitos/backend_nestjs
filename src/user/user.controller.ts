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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post('admin')
  async createAdmin(@Body() dto: CreateUserDto, @Request() req: RequestUser) {
    const typeUser = await this.userService.getTypeUser(dto.user_Typeid);

    if (typeUser.name.toLowerCase() !== Role.Admin.toLowerCase()) {
      throw new ConflictException('Only Admin type can be created here');
    }

    return this.userService.create(dto, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get('email/:email')
  async findByEmail(@Param('email') email: string) {
    return this.userService.findByEmail(email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userService.findById(id);
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }
}
