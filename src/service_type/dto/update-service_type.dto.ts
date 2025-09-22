import { IsNotEmpty, MaxLength, IsString } from 'class-validator';

export class UpdateServiceTypeDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name: string;

  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description: string;
}
