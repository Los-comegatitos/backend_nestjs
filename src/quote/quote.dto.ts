import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDecimal,
  IsInt,
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumberString,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ServiceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
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
  @IsNumberString()
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
