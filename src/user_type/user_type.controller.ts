import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserTypeService } from './user_type.service';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { CreateUserTypeDto } from './dto/create-user_type.dto';
import { UpdateUserTypeDto } from './dto/update-user_type.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('user-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserTypeController {
  constructor(private readonly userTypeService: UserTypeService) {}

  @Post()
  @Roles(Role.Admin)
  async create(@Body() dto: CreateUserTypeDto) {
    return await this.userTypeService.create(dto);
  }

  @Get()
  @Roles(Role.Admin)
  async findAll() {
    return await this.userTypeService.findAll();
  }

  @Patch(':id')
  @Roles(Role.Admin)
  async update(@Param('id') id: string, @Body() dto: UpdateUserTypeDto) {
    return await this.userTypeService.update(+id, dto);
  }
}
