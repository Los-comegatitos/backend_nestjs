import { CreateTypeClientDto } from './create-client_type.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateClientTypeDto extends PartialType(CreateTypeClientDto) {
  @ApiProperty()
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  @IsNotEmpty({ message: 'The name cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  name: string;

  @ApiProperty()
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  @IsNotEmpty({ message: 'The name cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  description?: string;
}
