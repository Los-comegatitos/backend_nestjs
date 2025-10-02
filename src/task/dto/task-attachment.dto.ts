import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AttachmentDto {
  @ApiProperty({ example: 'file1', description: 'Attachment ID' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  id: string;

  @ApiProperty({ example: 'agenda.pdf', description: 'Attachment file name' })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  fileName: string;
}
