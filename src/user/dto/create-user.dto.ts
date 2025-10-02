import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'The name cannot be empty' })
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'User email cannot be empty' })
  @IsEmail({}, { message: 'The email is not valid' })
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @ApiProperty()
  @IsNumber()
  user_Typeid: number;
}
