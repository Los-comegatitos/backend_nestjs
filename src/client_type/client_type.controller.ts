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
    
    

    @Get()
    async GetAll() {
        return await this.service.findAll()
    }
  
    @Get('/:name')
    async GetOneByName(@Param('name') name : string) {
        return await this.service.findOneByName(name)
    }

   
    @Post()
    async Create(@Body() body : ClientTypes) {
        return await this.service.create(body)
    }
    
 
    @Put('/:name')
    async Update(@Param('name') name : string, @Body() body : ClientTypes) {
        return await this.service.update(name, body)
    }
    

    @Delete('/:name') 
    async Eliminar(@Param('name') name : string) {
        return await this.service.remove(name)
    }


}
