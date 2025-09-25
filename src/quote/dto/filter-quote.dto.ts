import { IsNumber } from 'class-validator';

export class FilterQuoteDto {
  @IsNumber()
  eventId: number;
}
