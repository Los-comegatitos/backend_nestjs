import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommentDto {
  @ApiProperty({
    example: 'user123',
    description: 'User ID of the comment author',
  })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  idUser: string;

  @ApiProperty({
    example: 'admin',
    description: 'User type of the comment author',
  })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  userType: string;

  @ApiProperty({
    example: '2025-09-30T12:00:00Z',
    description: 'Date of the comment (ISO string)',
  })
  @IsDateString()
  date: Date;

  @ApiProperty({
    example: 'Confirmar disponibilidad',
    description: 'Comment text',
  })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  description: string;
}
