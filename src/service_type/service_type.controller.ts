import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
// import {UseGuards} from '@nestjs/common';
import { UpdateServiceTypeDto } from './dto/update-service_type.dto';
import { CreateServiceTypeDto } from './dto/create-service_type.dto';
// import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
// import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { ServiceTypeService } from './service_type.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('service-type')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class ServiceTypeController {
  constructor(private readonly service: ServiceTypeService) {}

  @ApiBearerAuth()
  @Get()
  @Roles(Role.Admin)
  async getAll() {
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
  async create(@Body() body: CreateServiceTypeDto) {
    return await this.service.create(body);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles(Role.Admin)
  async update(@Param('id') id: string, @Body() dto: UpdateServiceTypeDto) {
    return await this.service.update(+id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles(Role.Admin)
  async remove(@Param('id') id: string) {
    return await this.service.remove(+id);
  }
}
