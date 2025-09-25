import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class UpdateEventTypeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @MaxLength(255, { message: 'Name cannot exceed 255 characters' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @MaxLength(255, { message: 'Description cannot exceed 255 characters' })
  description?: string;
}
