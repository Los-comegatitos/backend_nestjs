import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'The name must be text' })
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'The description must be text' })
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Reminder date must be in valid format' })
  reminderDate?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString({}, { message: 'Due date must be in valid format' })
  dueDate?: Date;
}
