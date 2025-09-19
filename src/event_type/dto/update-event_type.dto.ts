
import { IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateEventTypeDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description?: string;
}
