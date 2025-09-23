import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEventTypeDto {
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  @IsString({ message: 'The name must be a text' })
  name: string;

  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'The name must be a text' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description: string;
}
