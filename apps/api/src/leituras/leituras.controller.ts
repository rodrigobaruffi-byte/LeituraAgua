import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateLeituraDto } from './dto/create-leitura.dto';
import { LeiturasService } from './leituras.service';

@Controller('leituras')
export class LeiturasController {
  constructor(private readonly leiturasService: LeiturasService) {}

  @Get()
  findAll() {
    return this.leiturasService.findAll();
  }

  @Post()
  create(@Body() dto: CreateLeituraDto) {
    return this.leiturasService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leiturasService.remove(id);
  }
}
