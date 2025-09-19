
import { IsNotEmpty, MaxLength } from 'class-validator';

export class CreateEventTypeDto {
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name: string;

  @IsNotEmpty({ message: 'Description is required' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description: string;
}
