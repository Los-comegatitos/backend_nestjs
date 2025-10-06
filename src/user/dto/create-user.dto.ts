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
  @IsNotEmpty({ message: 'Los nombres no puede estar vacío' })
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Los apellidos no puede estar vacío' })
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'El email no puede estar vacío' })
  @IsEmail({}, { message: 'El email no es válido' })
  @IsString()
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(8, {
    message: 'La contraseña tiene que tener al menos 8 caracteres',
  })
  password: string;

  @ApiProperty()
  @IsNumber()
  user_Typeid: number;
}
