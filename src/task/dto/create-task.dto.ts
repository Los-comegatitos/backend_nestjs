import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre tiene que ser texto' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  @IsString({ message: 'La descripción tiene que ser texto' })
  description: string;

  @ApiProperty({ type: String, example: '2025-12-31T23:59:59Z' })
  @IsDateString(
    {},
    { message: 'La fecha tiene que estar en un formato válido' },
  )
  @IsNotEmpty({ message: 'La fecha debe no puede estar vacía' })
  dueDate: Date;

  @ApiProperty({ type: String, example: '2025-12-15T10:00:00Z' })
  @IsNotEmpty({ message: 'La fecha no puede estar vacía' })
  @IsDateString(
    {},
    {
      message: 'La fecha de recordatorio tiene que estar en un formato válido',
    },
  )
  reminderDate: Date;
}
