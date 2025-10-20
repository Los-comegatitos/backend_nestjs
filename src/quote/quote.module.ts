import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { Quote, QuoteShema } from './quote.document';
import { ServiceTypeModule } from 'src/service_type/service_type.module';
import { EventModule } from 'src/event/event.module';
import { NotificationModule } from 'src/notification/notification.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    ServiceTypeModule,
    forwardRef(() => EventModule),
    MongooseModule.forFeature([{ name: Quote.name, schema: QuoteShema }]),
    NotificationModule,
    UserModule,
  ],
  providers: [QuoteService],
  controllers: [QuoteController],
  exports: [MongooseModule],
})
export class QuoteModule {}
