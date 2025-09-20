import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'The name cannot be empty' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @IsString()
  lastName: string;

  @IsNotEmpty({ message: 'User email cannot be empty' })
  @IsEmail({}, { message: 'The email is not valid' })
  @IsString()
  email: string;

  @IsNotEmpty({ message: 'Telephone cannot be empty' })
  @IsString()
  telephone: string;

  @IsNotEmpty({ message: 'Date of birth cannot be empty' })
  birthDate: Date;

  @IsNotEmpty({ message: 'Password cannot be empty' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;


}
