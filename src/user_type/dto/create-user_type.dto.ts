
import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreateUserTypeDto {
  @IsString()
  @IsNotEmpty({ message: 'Name should not be empty' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Description should not be empty' })
  @MinLength(5, { message: 'Description must be at least 5 characters long' })
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  description: string;
}
