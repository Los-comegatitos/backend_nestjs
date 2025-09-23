import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateServiceTypeDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'The name must be a text' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'The name must be a text' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description: string;
}
