import { CreateTypeClientDto } from './create-client_type.dto';
import {IsOptional, IsString} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateClientTypeDto extends PartialType(CreateTypeClientDto) {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;



}