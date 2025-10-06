import { CreateUserDto } from './create-user.dto';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  birthDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail({}, { message: 'El email no es válido' })
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  telephone?: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @MinLength(8, { message: 'Password must be at least 8 characters' })
  // password?: string;

  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsNumber()
  // user_Typeid?: number;
}
