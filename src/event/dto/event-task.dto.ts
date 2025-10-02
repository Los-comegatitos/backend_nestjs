import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class AttachmentDto {
  @ApiProperty({ example: 'file1', description: 'Attachment ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: 'agenda.pdf', description: 'File name' })
  @IsString()
  @IsNotEmpty()
  fileName: string;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Revisar contrato con proveedor' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Contrato debe revisarse antes del 5 de octubre' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '2025-09-30T10:00:00Z' })
  @IsDate()
  @Type(() => Date)
  creationDate: Date;

  @ApiProperty({ example: '2025-10-05T17:00:00Z' })
  @IsDate()
  @Type(() => Date)
  dueDate: Date;

  @ApiProperty({ example: '2025-10-02T08:00:00Z' })
  @IsDate()
  @Type(() => Date)
  reminderDate: Date;

  @ApiPropertyOptional({ type: [AttachmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @ApiPropertyOptional({
    example: 'provider123',
    description: 'Associated provider ID',
  })
  @IsOptional()
  @IsString()
  associatedProviderId?: string | null;

  @ApiProperty({ enum: ['pending', 'completed'], example: 'pending' })
  @IsEnum(['pending', 'completed'])
  status: 'pending' | 'completed';
}
