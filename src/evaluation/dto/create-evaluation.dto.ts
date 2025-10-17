import { IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEvaluationDto {
  @ApiProperty({
    example: '2111111112112',
    description: 'ID del evento en el que participó el proveedor',
  })
  @IsString()
  eventId: string;

  @ApiProperty({
    example: '42',
    description: 'ID del organizador que califica al proveedor',
  })
  @IsString()
  organizerUserId: string;

  @ApiProperty({
    example: '83',
    description: 'ID del proveedor que se está calificando',
  })
  @IsString()
  providerId: string;

  @ApiProperty({
    example: 5,
    description: 'Calificación numérica del proveedor (0 a 5)',
    minimum: 0,
    maximum: 5,
  })
  @IsInt()
  @Min(0)
  @Max(5)
  score: number;
}
