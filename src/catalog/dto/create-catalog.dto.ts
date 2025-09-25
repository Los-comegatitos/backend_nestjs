import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @IsNotEmpty()
  @IsString()
  serviceTypeId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
  quantity: number | null;
}

export class CreateCatalogDto {
  @IsNotEmpty()
  @IsString()
  providerId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateServiceDto)
  services: CreateServiceDto[];
}
