import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  serviceTypeId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;
}

export class QuoteDto {
  @ApiProperty()
  @IsInt()
  quantity: number;

  @ApiProperty()
  @IsDecimal()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty()
  @IsNotEmpty()
  toServiceId: string;

  @ApiProperty()
  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested({ each: true })
  @Type(() => ServiceDto)
  service: ServiceDto;
}
