
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTypeService } from './user_type.service';
import { UserTypeController } from './user_type.controller';
import { UserType } from './entities/user_type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserType])],
  providers: [UserTypeService],
  controllers: [UserTypeController],
  exports: [UserTypeService],
})
export class UserTypeModule {}
