import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateLeituraSaneparDto } from './dto/create-leiturasanepar.dto';
import { LeiturasSaneparService } from './leiturasanepar.service';

@Controller('leiturassanepar')
export class LeiturasSaneparController {
  constructor(private readonly leiturasSaneparService: LeiturasSaneparService) {}

  @Get()
  findAll() {
    return this.leiturasSaneparService.findAll();
  }

  @Post()
  create(@Body() dto: CreateLeituraSaneparDto) {
    return this.leiturasSaneparService.create(dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.leiturasSaneparService.remove(id);
  }
}
