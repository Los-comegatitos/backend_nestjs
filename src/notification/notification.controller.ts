import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { NotificationDto } from './notification.dto';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-strategy/jwt-auth.guard';
import { Request } from 'express';
import { UserPayload } from 'src/auth/user-payload.type';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  async listNotifications(@Req() info: Request) {
    const { email } = info.user as UserPayload;
    return await this.service.getEarlyNotifications(email);
  }

  @Post()
  async Send(@Body() body: NotificationDto) {
    return await this.service.sendEmail(body);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: Number })
  async MarkAsSeen(@Param('id') id: number) {
    return await this.service.markAsSeenNotification(id);
  }
}
