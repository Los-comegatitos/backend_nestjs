import { Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';

@Module({
  providers: [CatalogService],
  controllers: [CatalogController]
})
export class CatalogModule {}
