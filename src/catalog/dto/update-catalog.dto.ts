import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateCatalogDto } from './create-catalog.dto';

// Este dto solo considera como modificable description, pero es lo único modificable realmente.
export class UpdateCatalogDto extends PartialType(CreateCatalogDto) {
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  description: string;
}
