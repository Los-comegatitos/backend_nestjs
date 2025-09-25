import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateUserTypeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'The name must be a text' })
  @MinLength(3, { message: 'Name must be at least 3 characters long' })
  @MaxLength(255, { message: 'Name must not exceed 255 characters' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'The name must be a text' })
  @MinLength(5, { message: 'Description must be at least 5 characters long' })
  @MaxLength(255, { message: 'Description must not exceed 255 characters' })
  description?: string;
}
