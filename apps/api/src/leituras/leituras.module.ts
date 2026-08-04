import { Module } from '@nestjs/common';
import { LeiturasController } from './leituras.controller';
import { LeiturasService } from './leituras.service';

@Module({
  controllers: [LeiturasController],
  providers: [LeiturasService],
})
export class LeiturasModule {}
