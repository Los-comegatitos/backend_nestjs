import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { User_Type } from '../user_type/user_type.entity';
import { CatalogModule } from 'src/catalog/catalog.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, User_Type]),
    forwardRef(() => CatalogModule),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
