import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientTypeService } from './client_type.service';
import { UpdateClientTypeDto } from './dto/update-client_type.dto';
import { CreateTypeClientDto } from './dto/create-client_type.dto';

@Controller('client-type')
export class ClientTypeController {
  constructor(private readonly service: ClientTypeService) {}

  // Listar todos
  @Get()
  async Listar() {
    return await this.service.findAll();
  }

  @Get('/:name')
  async Buscar(@Param('name') name: string) {
    return await this.service.findOneByName(name);
  }

  @Post()
  async Crear(@Body() body: CreateTypeClientDto) {
    return await this.service.create(body);
  }

  @Put('/:name')
  async Modificar(
    @Param('name') name: string,
    @Body() body: UpdateClientTypeDto,
  ) {
    return await this.service.update(name, body);
  }

  @Delete('/:name')
  async Eliminar(@Param('name') name: string) {
    return await this.service.remove(name);
  }
}
