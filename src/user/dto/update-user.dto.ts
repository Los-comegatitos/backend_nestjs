import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  birthDate?: Date;

  @IsOptional()
  @IsEmail({}, { message: 'The email is not valid' })
  email?: string;

  @IsOptional()
  telephone?: string;

  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password?: string;

  @IsOptional()
  @IsNumber()
  user_Typeid?: number;


}