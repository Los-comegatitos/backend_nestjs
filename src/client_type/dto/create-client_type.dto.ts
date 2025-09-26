import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTypeClientDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'The name cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  description: string;
}
