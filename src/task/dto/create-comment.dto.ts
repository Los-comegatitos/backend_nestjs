import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ description: 'Contenido del comentario' })
  @IsNotEmpty()
  @IsString()
  description: string;
}
