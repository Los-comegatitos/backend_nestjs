import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto' })
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de recordatorio debe estar en un formato válido' },
  )
  reminderDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha de vencimiento debe estar en un formato válido' },
  )
  dueDate?: Date;
}
