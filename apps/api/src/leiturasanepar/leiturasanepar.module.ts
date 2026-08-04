import { Module } from '@nestjs/common';
import { LeiturasSaneparController } from './leiturasanepar.controller';
import { LeiturasSaneparService } from './leiturasanepar.service';

@Module({
  controllers: [LeiturasSaneparController],
  providers: [LeiturasSaneparService],
})
export class LeiturasSaneparModule {}
