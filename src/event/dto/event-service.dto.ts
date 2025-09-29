import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class AddServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  serviceTypeId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  dueDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  quantity: number | null;
}
