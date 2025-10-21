import { MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @MinLength(8, {
    message: 'La contraseña tiene que tener al menos 8 caracteres',
  })
  password: string;
}
