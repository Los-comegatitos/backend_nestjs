import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ClientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  clientTypeId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateEventDto {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: String, example: '2025-12-31T23:59:59Z' })
  @IsDateString()
  eventDate: Date;

  @ApiProperty({ type: ClientDto })
  @ValidateNested()
  @Type(() => ClientDto)
  client: ClientDto;

  @ApiProperty()
  @IsNumber()
  eventTypeId: number;

  @ApiProperty()
  @IsNumber()
  organizerUserId: number;

  /*@ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  services?: string[];

  /*@ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsOptional()
  tasks?: string[];*/
}
