import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
<<<<<<< HEAD
=======
import { User } from './user.entity';
import { User_Type } from '../user_type/user_type.entity';


>>>>>>> feat/user-type
@Module({
  imports: [
    TypeOrmModule.forFeature([User, User_Type])
  ],
  providers: [UserService],
  controllers: [UserController],
<<<<<<< HEAD
=======
  exports: [UserService],
>>>>>>> feat/user-type
})
export class UserModule {}
