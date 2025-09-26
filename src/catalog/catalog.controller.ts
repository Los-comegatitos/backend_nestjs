import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { AddServiceDto } from './dto/add-service.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  // Por ahora en controller por motivos de prueba, pero no debe existir como endpoint
  @ApiBearerAuth()
  @Post('add/:providerId')
  async addCatalog(@Param('providerId') providerId: string) {
    return await this.catalogService.create(providerId);
  }
  // -----------------------------------------------------------------------------

  @ApiBearerAuth()
  @Get(':providerId')
  async findOneByProviderId(@Param('providerId') providerId: string) {
    return await this.catalogService.findCatalogByProviderId(providerId);
  }

  @ApiBearerAuth()
  @Patch(':providerId/description')
  async updateDescription(
    @Param('providerId') providerId: string,
    @Body() dto: UpdateCatalogDto,
  ) {
    return await this.catalogService.updateDescription(providerId, dto);
  }

  @ApiBearerAuth()
  @Post(':providerId/services')
  async addService(
    @Param('providerId') providerId: string,
    @Body() dto: AddServiceDto,
  ) {
    return await this.catalogService.addService(providerId, dto);
  }

  @ApiBearerAuth()
  @Delete(':providerId/services/:serviceName')
  async removeService(
    @Param('providerId') providerId: string,
    @Param('serviceName') serviceName: string,
  ) {
    return await this.catalogService.removeService(providerId, serviceName);
  }

  @ApiBearerAuth()
  @Patch(':providerId/services/:serviceName')
  async updateService(
    @Param('providerId') providerId: string,
    @Param('serviceName') serviceName: string,
    @Body() dto: Partial<AddServiceDto>,
  ) {
    return await this.catalogService.updateService(
      providerId,
      serviceName,
      dto,
    );
  }
}
