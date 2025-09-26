import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRE_SQL_HOST') || 'localhost',
        port: parseInt(
          configService.get<string>('POSTGRE_SQL_PORT') || '5432',
          10,
        ),
        username:
          configService.get<string>('POSTGRE_SQL_USERNAME') || 'postgres',
        password:
          configService.get<string>('POSTGRE_SQL_PASSWORD') || 'postgres',
        database: configService.get<string>('POSTGRE_SQL_DATABASE') || 'app_db',
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
      inject: [ConfigService],
    }),

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
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
