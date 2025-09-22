import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ClientTypeService } from './client_type.service';
import { UpdateClientTypeDto } from './dto/update-client_type.dto';
import { CreateTypeClientDto } from './dto/create-client_type.dto';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';

@Controller('client-type')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientTypeController {
  constructor(private readonly service: ClientTypeService) {}

  @Get()
  @Roles(Role.Admin)
  async Listar() {
    return await this.service.findAll();
  }

  @Get('/:name')
  @Roles(Role.Admin)
  async Buscar(@Param('name') name: string) {
    return await this.service.findOneByName(name);
  }

  @Post()
  async Crear(@Body() body: CreateTypeClientDto) {
    return await this.service.create(body);
  }

  @Put('/:name')
  @Roles(Role.Admin)
  async Modificar(
    @Param('name') name: string,
    @Body() body: UpdateClientTypeDto,
  ) {
    return await this.service.update(name, body);
  }

  @Delete('/:name')
  @Roles(Role.Admin)
  async Eliminar(@Param('name') name: string) {
    return await this.service.remove(name);
  }
}
