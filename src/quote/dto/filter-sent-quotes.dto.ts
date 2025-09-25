import { IsOptional, IsString } from 'class-validator';

export class FilterSentQuotesDto {
  @IsOptional()
  @IsString()
  status?: 'pending' | 'accepted' | 'rejected';
}
