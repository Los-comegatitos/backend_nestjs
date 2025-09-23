import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Quote, QuoteShema } from './quote.document';

@Module({
  providers: [QuoteService],
  controllers: [QuoteController],
  imports: [
    MongooseModule.forFeature([{ name: Quote.name, schema: QuoteShema }]),
  ],
})
export class QuoteModule {}
