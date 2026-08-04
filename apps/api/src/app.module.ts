import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { LeiturasModule } from './leituras/leituras.module';
import { LeiturasSaneparModule } from './leiturasanepar/leiturasanepar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    LeiturasModule,
    LeiturasSaneparModule,
  ],
})
export class AppModule {}
