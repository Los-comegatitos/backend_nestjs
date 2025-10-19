import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { Notification_type } from './notification.enum';

export class NotificationDto {
  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  @IsEmail({}, { each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
  emails: string[];

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  route: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  url: string;

  //   @ApiProperty()
  //   @IsString()
  //   @IsNotEmpty()
  //   message: string;

  @ApiProperty()
  @IsEnum(Notification_type)
  type: Notification_type;
}
