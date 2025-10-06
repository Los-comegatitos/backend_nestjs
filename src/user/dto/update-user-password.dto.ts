import { MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
