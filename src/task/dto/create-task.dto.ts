import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  description: string;

  @ApiProperty({ type: String, example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  dueDate: Date;

  @ApiProperty({ type: String, example: '2025-12-15T10:00:00Z' })
  @IsDateString()
  reminderDate: Date;
}
