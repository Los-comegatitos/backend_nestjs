import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quote, QuoteShema } from './quote.document';
import { ServiceTypeModule } from 'src/service_type/service_type.module';
import { EventModule } from 'src/event/event.module';

@Module({
  providers: [QuoteService],
  controllers: [QuoteController],
  imports: [
    ServiceTypeModule,
    EventModule,
    MongooseModule.forFeature([{ name: Quote.name, schema: QuoteShema }]),
  ],
})
export class QuoteModule {}
