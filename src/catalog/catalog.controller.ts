import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { AddCatalogServiceDto } from './dto/add-catalog-service.dto';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/roles.enum';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
// @UseGuards(new JwtAuthGuard())
@Controller('catalog')
@ApiBearerAuth()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // Por ahora en controller por motivos de prueba, pero no debe existir como endpoint
  @Post('add/:providerId')
  async addCatalog(@Param('providerId') providerId: string) {
    return await this.catalogService.create(providerId);
  }
  // -----------------------------------------------------------------------------

  @Roles(Role.Provider)
  @Get()
  async findOneByProviderId(@Req() datos: Request) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    return await this.catalogService.findCatalogByProviderId(userId);
  }

  @Roles(Role.Provider)
  @Patch()
  async updateDescription(
    @Req() datos: Request,
    @Body() dto: UpdateCatalogDto,
  ) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    return await this.catalogService.updateDescription(userId, dto);
  }

  @Roles(Role.Provider)
  @Post('services')
  async addService(@Req() datos: Request, @Body() dto: AddCatalogServiceDto) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    return await this.catalogService.addService(userId, dto);
  }

  @Roles(Role.Provider)
  @Delete('services/:serviceName')
  async removeService(
    @Req() datos: Request,
    @Param('serviceName') serviceName: string,
  ) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    return await this.catalogService.removeService(userId, serviceName);
  }

  @Roles(Role.Provider)
  @Patch('services/:serviceName')
  async updateService(
    @Req() datos: Request,
    @Param('serviceName') serviceName: string,
    @Body() dto: Partial<AddCatalogServiceDto>,
  ) {
    const { userId } = datos.user as {
      userId: number;
      email: string;
      role: string;
    };
    return await this.catalogService.updateService(userId, serviceName, dto);
  }
}
