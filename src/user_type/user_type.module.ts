import { Module } from '@nestjs/common';
import { UserTypeService } from './user_type.service';
import { UserTypeController } from './user_type.controller';

@Module({
  providers: [UserTypeService],
  controllers: [UserTypeController],
})
export class UserTypeModule {}
