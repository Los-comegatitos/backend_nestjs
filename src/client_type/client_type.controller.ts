import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,

} from '@nestjs/common';
import { ClientTypeService } from './client_type.service';
import { ClientType } from './client_type.entity';

@Controller('client-type')
export class ClientTypeController {
        constructor(private readonly service : ClientTypeService) {}


}
