import { forwardRef, Module } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { CatalogController } from './catalog.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Catalog, CatalogSchema } from './catalog.document';
import { ServiceTypeModule } from 'src/service_type/service_type.module';
import { QuoteModule } from 'src/quote/quote.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Catalog.name, schema: CatalogSchema }]),
    forwardRef(() => ServiceTypeModule),
    QuoteModule,
    UserModule,
  ],
  providers: [CatalogService],
  controllers: [CatalogController],
  exports: [CatalogService],
})
export class CatalogModule {}
