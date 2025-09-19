import {IsNotEmpty, IsString} from 'class-validator';

export class CreateTypeClientDto {
  @IsNotEmpty({ message: 'The name cannot be empty' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString()
  description: string;


}
