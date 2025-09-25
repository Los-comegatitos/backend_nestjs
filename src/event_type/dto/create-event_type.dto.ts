import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateEventTypeDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  @IsString({ message: 'The name must be a text' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Description is required' })
  @IsString({ message: 'The name must be a text' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description: string;
}
