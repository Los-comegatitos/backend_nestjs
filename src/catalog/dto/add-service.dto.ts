import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class AddServiceDto {
  @IsNotEmpty()
  @IsString()
  serviceTypeId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  quantity: number | null;
}
