import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './notification.document';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

// WHYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYY
// THIS IS EVIL :'V
@Module({
  providers: [NotificationService],
  controllers: [NotificationController],
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.get<string>('GMAIL_EMAIL'),
            pass: configService.get<string>('APP_PASSWORD'),
          },
          tls: {
            // ciphers: 'SSLv3',
            rejectUnauthorized: false,
          },
        },
        defaults: {
          from: `"Gestionainador" <${configService.get<string>('GMAIL_EMAIL')}>`,
        },
      }),
    }),
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
