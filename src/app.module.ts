
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientTypeModule } from './client_type/client_type.module';
import { ServiceTypeModule } from './service_type/service_type.module';
import { EventTypeModule } from './event_type/event_type.module';
import { UserTypeModule } from './user_type/user_type.module';
import { UserModule } from './user/user.module';
import { EventModule } from './event/event.module';
import { CatalogModule } from './catalog/catalog.module';
import { AuthModule } from './auth/auth.module';
import { AibotModule } from './aibot/aibot.module';
import { TaskModule } from './task/task.module';
import { QuoteModule } from './quote/quote.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { ServiceModule } from './service/service.module';

@Module({
  imports: [
    ClientTypeModule,
    ServiceTypeModule,
    EventTypeModule,
    UserTypeModule,
    UserModule,
    EventModule,
    CatalogModule,
    AuthModule,
    AibotModule,
    TaskModule,
    QuoteModule,
    EvaluationModule,
    ServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
