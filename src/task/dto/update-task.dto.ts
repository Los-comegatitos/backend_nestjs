import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  name: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'The name must be a text' })
  description: string;
}
