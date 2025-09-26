import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ClientTypeService } from './client_type.service';
import { UpdateClientTypeDto } from './dto/update-client_type.dto';
import { CreateTypeClientDto } from './dto/create-client_type.dto';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('client-type')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientTypeController {
  constructor(private readonly service: ClientTypeService) {}

  @ApiBearerAuth()
  @Get()
  async GetAll() {
    return await this.service.findAll();
  }

  @ApiBearerAuth()
  @Get('/:name')
  @Roles(Role.Admin)
  async findOneByName(@Param('name') name: string) {
    return await this.service.findOneByName(name);
  }

  @ApiBearerAuth()
  @Get(':id')
  @Roles(Role.Admin)
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(+id);
  }

  @ApiBearerAuth()
  @Post()
  @Roles(Role.Admin)
  async Create(@Body() body: CreateTypeClientDto) {
    return await this.service.create(body);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles(Role.Admin)
  async update(@Param('id') id: string, @Body() dto: UpdateClientTypeDto) {
    return await this.service.update(+id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles(Role.Admin)
  async remove(@Param('id') id: string) {
    return await this.service.remove(+id);
  }
}
