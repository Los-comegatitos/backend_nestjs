import { Module } from '@nestjs/common';
import { AibotService } from './aibot.service';
import { AibotController } from './aibot.controller';

@Module({
  providers: [AibotService],
  controllers: [AibotController]
})
export class AibotModule {}
