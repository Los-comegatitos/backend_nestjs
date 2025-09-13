import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientTypeModule } from './client_type/client_type.module';
import { ServiceTypeModule } from './service_type/service_type.module';
import { EventTypeModule } from './event_type/event_type.module';
import { UserTypeModule } from './user_type/user_type.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [ClientTypeModule, ServiceTypeModule, EventTypeModule, UserTypeModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
