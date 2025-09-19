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
import { CreateUserTypeDto } from './dto/create-user_type.dto';
import { UpdateUserTypeDto } from './dto/update-user_type.dto';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@Controller('user-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserTypeController {
  constructor(private readonly userTypeService: UserTypeService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() dto: CreateUserTypeDto) {
    return this.userTypeService.create(dto);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.userTypeService.findAll();
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() dto: UpdateUserTypeDto) {
    return this.userTypeService.update(+id, dto);
  }
}
