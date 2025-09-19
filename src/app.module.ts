import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
<<<<<<< HEAD
=======
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRE_SQL_HOST || 'localhost',
      port: parseInt(process.env.POSTGRE_SQL_PORT || '5432', 10),
      username: process.env.POSTGRE_SQL_USERNAME || 'postgres',
      password: process.env.POSTGRE_SQL_PASSWORD || 'postgres',
      database: process.env.POSTGRE_SQL_DATABASE || 'app_db',
      autoLoadEntities: true,
      synchronize: true,
      ssl: { rejectUnauthorized: false },
    }),

>>>>>>> feat/user-type
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
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
