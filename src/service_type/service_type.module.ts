import { forwardRef, Module } from '@nestjs/common';
import { ServiceTypeService } from './service_type.service';
import { ServiceTypeController } from './service_type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceType } from './service_type.entity';
import { CatalogModule } from 'src/catalog/catalog.module';
import { EventModule } from 'src/event/event.module';

@Module({
  providers: [ServiceTypeService],
  controllers: [ServiceTypeController],
  imports: [
    TypeOrmModule.forFeature([ServiceType]),
    forwardRef(() => CatalogModule),
    forwardRef(() => EventModule),
  ],
  exports: [ServiceTypeService],
})
export class ServiceTypeModule {}
