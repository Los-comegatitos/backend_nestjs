
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypeService } from './user_type.service';
import { UserTypeController } from './user_type.controller';
import { User_Type } from './user_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User_Type])],
  providers: [UserTypeService],
  controllers: [UserTypeController],
  exports: [UserTypeService],
})
export class UserTypeModule {}
